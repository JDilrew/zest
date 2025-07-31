// Minimal Jest-like runtime for zest as a class
import { pathToFileURL } from "url";
import vm, { compileFunction } from "vm";
import { transpileToCommonJS } from "@heritage/zest-transform";
import fs from "fs";
import path from "path";
import { createRequire } from "module";

class ZestRuntime {
  constructor(testEngine = "juice", environment, resolver) {
    this.testEngine = testEngine;
    this.environment = environment; // Environment instance (e.g., JsdomEnvironment)
    this.resolver = resolver; // Resolver instance
    this.mocks = new Map(); // Track mocks by module name
  }

  async setupTestGlobals() {
    const vmContext = this.environment.getVmContext();

    const zestJuice = await import("@heritage/zest-juice");
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

  registerMock(moduleName, mockImpl) {
    this.mocks.set(moduleName, mockImpl);
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

  teardown() {
    // TODO: reset all mocks
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
      // this._config.injectGlobals ? "jest" : undefined,
      // ...this._config.sandboxInjectedGlobals,
    ];
  }

  requireModuleOrMock(moduleName, nodeRequire, testFile) {
    console.log("Resolving module:", moduleName);

    if (this.mocks.has(moduleName)) {
      console.log("Using mock for module:", moduleName);
      return this.mocks.get(moduleName);
    }

    // If it's a relative path, resolve it relative to the test file
    if (moduleName.startsWith(".") || moduleName.startsWith("/")) {
      const testDir = path.dirname(testFile);
      const resolvedPath = nodeRequire.resolve(
        path.resolve(testDir, moduleName)
      );
      return nodeRequire(resolvedPath);
    }

    return nodeRequire(moduleName);
  }

  async loadTestFile(testFile) {
    // const src = await this.importWithMocks(testFile);
    const src = await fs.promises.readFile(pathToFileURL(testFile), "utf8");
    // here you would transpile the `src` if required.

    const transformedSrc = transpileToCommonJS(src, testFile);

    // console.log("Transformed source code:", transformedSrc);

    const vmContext = this.environment.getVmContext();

    // const zestJuice = await import("@heritage/zest-juice");
    // vmContext.globalThis.suite = zestJuice.suite;
    // vmContext.globalThis.test = zestJuice.test;
    // vmContext.globalThis.beforeAll = zestJuice.beforeAll;
    // vmContext.globalThis.afterAll = zestJuice.afterAll;
    // vmContext.globalThis.beforeEach = zestJuice.beforeEach;
    // vmContext.globalThis.afterEach = zestJuice.afterEach;
    // vmContext.globalThis.expect = zestJuice.expect;

    const fn = compileFunction(
      transformedSrc,
      this.constructInjectedModuleParameters(),
      {
        filename: testFile,
        parsingContext: vmContext,
        // support for dynamic imports, e.g., for await import('some-module'):
        // importModuleDynamically: async (data) => {
        //   console.log("Importing module dynamically:", data);
        // },
      }
    );

    const __filename = testFile;
    const __dirname = path.dirname(testFile);

    const nodeRequire = createRequire(import.meta.url); // capture Node's require

    vmContext.require = (moduleName) =>
      this.requireModuleOrMock(moduleName, nodeRequire, testFile);
    vmContext.globalThis.require = vmContext.require;
    vmContext.__filename = __filename;
    vmContext.__dirname = __dirname;

    // Inject global zest with mock method
    const runtime = this;
    vmContext.zest = {
      mock: (moduleName, mockImpl) => {
        console.log("Registering mock for module:", moduleName);
        runtime.registerMock(moduleName, mockImpl);
      },
    };
    vmContext.globalThis.zest = vmContext.zest;

    const module = {
      exports: {},
      require: vmContext.require,
    };

    console.log("Step runtime-1");
    const run = fn(
      module,
      module.exports,
      module.require,
      __dirname,
      __filename,
      vmContext.zest
    );

    console.log("Step runtime-2");
    return run;
  }
}

export { ZestRuntime };
