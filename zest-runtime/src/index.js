// Minimal Jest-like runtime for zest as a class
import { pathToFileURL } from "url";
import { compileFunction } from "vm";

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
    await import(runner);
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

  async importWithMocks(testFile) {
    // MVP: inject all mocks into global before import
    this.setupMocks();
    // The test file should use: import {foo} from 'foo'; and access global.foo if mocked
    await import(pathToFileURL(testFile).href);
    // Optionally reset mocks after loading
    // this.resetMocks();
  }

  async loadTestFile(testFile) {
    const src = await this.importWithMocks(testFile);

    const context = this.environment.getVmContext();
    return compileFunction(src, [], {
      filename: "get name",
      parsingContext: context,
      importModuleDynamically: (data) => {
        console.log("Importing module dynamically:", data);
      },
    });
  }
}

export { ZestRuntime };
