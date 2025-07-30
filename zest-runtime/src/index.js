// Minimal Jest-like runtime for zest as a class
import { pathToFileURL } from "url";
import { compileFunction } from "vm";
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
    const runner =
      this.testEngine === "juice" ? "@heritage/zest-juice" : this.testEngine;
    const { run } = await import(runner);
    return run;
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
      // this._config.injectGlobals ? "jest" : undefined,
      // ...this._config.sandboxInjectedGlobals,
    ];
  }

  requireModuleOrMock(moduleName, nodeRequire, testFile) {
    if (this.mocks.has(moduleName)) {
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
    const fn = compileFunction(
      transformedSrc,
      this.constructInjectedModuleParameters(),
      {
        filename: "get name",
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

    const module = {
      exports: {},
      require: vmContext.require,
    };

    const run = fn(
      module,
      module.exports,
      module.require,
      __dirname,
      __filename
    );

    return run;
  }
}

export { ZestRuntime };
