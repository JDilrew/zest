// Minimal Jest-like runtime for zest as a class
import { pathToFileURL } from "url";
import vm, { compileFunction } from "vm";
import { transpileToCommonJS } from "@heritage/zest-transform";
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { ZestMocker } from "@heritage/zest-mock";
import { ZestResolver } from "@heritage/zest-resolve";

class ZestRuntime {
  constructor(testEngine = "juice", environment, resolver) {
    this.testEngine = testEngine;
    this.environment = environment;
    this.resolver = resolver;

    // Manual mock registry (moduleName/bare/normalized → mocked exports)
    this.mocks = new Map();

    // Function/spy mocker
    this.mocker = new ZestMocker(this.environment?.global ?? globalThis);
  }

  async setupTestGlobals() {
    const vmContext = this.environment.getVmContext();

    const zestJuice = await import("@heritage/zest-juice");
    zestJuice.resetTestState();

    vmContext.globalThis.suite = zestJuice.suite;
    vmContext.globalThis.test = zestJuice.test;
    vmContext.globalThis.beforeAll = zestJuice.beforeAll;
    vmContext.globalThis.afterAll = zestJuice.afterAll;
    vmContext.globalThis.beforeEach = zestJuice.beforeEach;
    vmContext.globalThis.afterEach = zestJuice.afterEach;
    vmContext.globalThis.expect = zestJuice.expect || zestJuice.matchers;
    vmContext.globalThis.run = zestJuice.run;

    // Return a function that will call run from the VM context
    return async (emitter) => {
      vmContext.globalThis.emitter = emitter;
      return await vm.runInContext("run(emitter)", vmContext);
    };
  }

  // Wrap any function fields in a mock so tests can call .mockImplementation/.mockReturnValue
  _wrapMockExports(exportsLike) {
    if (typeof exportsLike === "function") {
      return this.mocker.fn(exportsLike);
    }
    if (exportsLike && typeof exportsLike === "object") {
      const out = { ...exportsLike };
      for (const k of Object.keys(out)) {
        if (typeof out[k] === "function") {
          out[k] = this.mocker.fn(out[k]);
        }
      }
      return out;
    }
    return exportsLike;
  }

  registerMock(moduleName, mockImpl, testFile) {
    const wrapped = this._wrapMockExports(mockImpl);
    // store under both normalized and raw so either lookup path hits
    const norm = this.resolver.normalize(moduleName, testFile ?? process.cwd());
    this.mocks.set(norm, wrapped);
    this.mocks.set(moduleName, wrapped);
  }

  teardown() {
    // Clear manual mock registry
    this.mocks.clear();
    // Restore spies and reset all function mocks
    this.mocker.restoreAllMocks();
    this.mocker.resetAllMocks();
  }

  constructInjectedModuleParameters() {
    // inject globals into the module scope
    return ["module", "exports", "require", "__dirname", "__filename", "zest"];
  }

  requireModuleOrMock(moduleName, nodeRequire, testFile) {
    const basedir = path.dirname(testFile);

    const {
      path: resolvedPath,
      isNodeModule,
      isCore,
      isMocked,
      mockKey,
    } = this.resolver.resolve(moduleName, {
      basedir,
      mocks: this.mocks,
      // moduleNameMapper: ... // feed from config if/when you add it
    });

    if (isMocked) {
      return this.mocks.get(mockKey);
    }

    if (isCore) {
      // core modules go through Node as-is
      return nodeRequire(moduleName);
    }

    if (!resolvedPath) {
      // Fallback to Node's resolution to mimic Node behavior on odd cases
      return nodeRequire(moduleName);
    }

    if (isNodeModule) {
      // external deps get loaded by Node
      return nodeRequire(resolvedPath);
    }

    // Project file: transpile & run inside the VM sandbox
    const src = fs.readFileSync(resolvedPath, "utf8");
    const transformedSrc = transpileToCommonJS(src, resolvedPath);
    const vmContext = this.environment.getVmContext();
    const fn = compileFunction(
      transformedSrc,
      this.constructInjectedModuleParameters(),
      { filename: resolvedPath, parsingContext: vmContext }
    );
    const module = { exports: {}, require: vmContext.require };
    fn(
      module,
      module.exports,
      module.require,
      path.dirname(resolvedPath),
      resolvedPath,
      vmContext.zest
    );
    return module.exports;
  }

  async loadTestFile(testFile) {
    const src = await fs.promises.readFile(pathToFileURL(testFile), "utf8");
    const transformedSrc = transpileToCommonJS(src, testFile);

    const vmContext = this.environment.getVmContext();

    const fn = compileFunction(
      transformedSrc,
      this.constructInjectedModuleParameters(),
      {
        filename: testFile,
        parsingContext: vmContext,
      }
    );

    const __filename = testFile;
    const __dirname = path.dirname(testFile);

    const nodeRequire = createRequire(import.meta.url); // capture Node's require

    vmContext.require = (moduleName) =>
      this.requireModuleOrMock(moduleName, nodeRequire, testFile);
    vmContext.globalThis.require = vmContext.require;
    vmContext.globalThis.console = this.environment.global.console;
    vmContext.__filename = __filename;
    vmContext.__dirname = __dirname;

    // Inject global zest backed by the mocker + resolver-aware module mocks
    const m = this.mocker;
    vmContext.zest = {
      // function mocks
      fn: m.fn.bind(m),
      isMockFunction: m.isMockFunction.bind(m),
      clearAllMocks: m.clearAllMocks.bind(m),
      resetAllMocks: m.resetAllMocks.bind(m),
      restoreAllMocks: m.restoreAllMocks.bind(m),

      // spying
      spyOn: m.spyOn.bind(m),

      // module-name registry (resolver consults this.mocks)
      mock: (moduleName, mockImpl) =>
        this.registerMock(moduleName, mockImpl, testFile),
    };
    vmContext.globalThis.zest = vmContext.zest;

    const module = {
      exports: {},
      require: vmContext.require,
    };

    const run = fn(
      module,
      module.exports,
      module.require,
      __dirname,
      __filename,
      vmContext.zest
    );

    return run;
  }
}

export { ZestRuntime };
