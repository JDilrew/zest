// Minimal Jest-like runtime for zest as a class
import { pathToFileURL } from "url";
import vm, { compileFunction } from "vm";
import { transpileToCommonJS } from "@heritage/zest-transform";
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { ZestMocker } from "@heritage/zest-mock";

class ZestRuntime {
  constructor(testEngine = "juice", environment, resolver) {
    this.testEngine = testEngine;
    this.environment = environment;
    this.resolver = resolver;

    // Module-name mock registry
    this.mocks = new Map();

    // function/spy mocker
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

  _normalizeModuleKey(moduleName, fromFile) {
    if (moduleName.startsWith(".") || moduleName.startsWith("/")) {
      const base = fromFile ? path.dirname(fromFile) : process.cwd();
      return path.resolve(base, moduleName);
    }
    // bare specifier: use as-is
    return moduleName;
  }

  _wrapMockExports(exportsLike) {
    // If user passed a function (e.g., default export), wrap it
    if (typeof exportsLike === "function") {
      return this.mocker.fn(exportsLike);
    }
    // If object, shallow-wrap any function properties as mocks
    if (exportsLike && typeof exportsLike === "object") {
      const out = { ...exportsLike };
      for (const key of Object.keys(out)) {
        if (typeof out[key] === "function") {
          out[key] = this.mocker.fn(out[key]);
        }
      }
      return out;
    }
    // pass through scalars
    return exportsLike;
  }

  registerMock(moduleName, mockImpl, testFile) {
    const key = this._normalizeModuleKey(moduleName, testFile);
    const wrapped = this._wrapMockExports(mockImpl);
    this.mocks.set(key, wrapped);
    // also keep raw key for exact-string matches if user used a different form
    this.mocks.set(moduleName, wrapped);
  }

  setupMocks() {
    // For each registered mock, inject into global
    for (const [moduleName, mockImpl] of this.mocks.entries()) {
      global[moduleName] = mockImpl;
    }
  }

  resetMocks() {
    for (const moduleName of this.mocks.keys()) {
      delete global[moduleName];
    }
    this.mocks.clear();
  }

  spyOn(obj, methodName) {
    if (!obj || typeof obj[methodName] !== "function") {
      throw new Error(`Cannot spy on ${methodName} - not a function`);
    }

    const original = obj[methodName];

    const spyFn = (...args) => {
      const call = { args, returned: undefined, threw: false };
      try {
        call.returned = original.apply(this, args);
        return call.returned;
      } catch (err) {
        call.threw = true;
        throw err;
      } finally {
        spy.calls.push(call);
      }
    };

    const spy = spyFn.bind(obj);
    spy.calls = [];
    spy.restore = () => {
      obj[methodName] = original;
    };

    // Store it for teardown
    this.spys.set(spy, {
      obj,
      methodName,
      original,
      spy,
    });

    obj[methodName] = spy;
    return spy;
  }

  resetSpys() {
    for (const { obj, methodName, original } of this.spys.values()) {
      obj[methodName] = original;
    }
    this.spys.clear();
  }

  teardown() {
    this.resetMocks(); // module-name mocks

    this.mocker.restoreAllMocks(); // restore spies
    this.mocker.resetAllMocks();
  }

  async importWithMocks(testFile) {
    this.setupMocks();

    const src = await import(pathToFileURL(testFile).href);

    // Optionally reset mocks after loading
    // this.resetMocks();

    return src;
  }

  readFile(filename) {
    const source = this._cacheFS.get(filename);

    if (!source) {
      const buffer = this.readFileBuffer(filename);
      source = buffer.toString("utf8");

      this._cacheFS.set(filename, source);
    }

    return source;
  }

  constructInjectedModuleParameters() {
    // inject globals into the module scope, including config based
    return [
      "module",
      "exports",
      "require",
      "__dirname",
      "__filename",
      "zest",
      // this._config.injectGlobals ? "zest" : undefined,
      // ...this._config.sandboxInjectedGlobals,
    ];
  }

  requireModuleOrMock(moduleName, nodeRequire, testFile) {
    // console.log("Resolving module:", moduleName);

    if (this.mocks.has(moduleName)) {
      // console.log("Using mock for module:", moduleName);
      return this.mocks.get(moduleName);
    }

    // If it's a relative path, resolve it relative to the test file
    if (moduleName.startsWith(".") || moduleName.startsWith("/")) {
      const testDir = path.dirname(testFile);
      const resolvedPath = path.resolve(testDir, moduleName);

      // Read and transpile the file if it's not in node_modules
      if (!resolvedPath.includes("node_modules")) {
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

      return nodeRequire(resolvedPath);
    }

    return nodeRequire(moduleName);
  }

  async loadTestFile(testFile) {
    // const src = await this.importWithMocks(testFile);
    const src = await fs.promises.readFile(pathToFileURL(testFile), "utf8");
    // here you would transpile the `src` if required.

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

    // Inject global zest with mock method
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

      // module-name registry (unchanged)
      mock: (moduleName, mockImpl) => this.registerMock(moduleName, mockImpl),
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
