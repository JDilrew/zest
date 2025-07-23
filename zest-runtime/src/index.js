// Minimal Jest-like runtime for zest as a class
import { pathToFileURL } from "url";

class ZestRuntime {
  constructor(testEngine = "@heritage/zest-juice") {
    this.testEngine = testEngine;
    this.mocks = new Map(); // Track mocks by module name
  }

  async setupTestGlobals() {
    await import(this.testEngine);
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
    // For MVP, just call importWithMocks
    await this.importWithMocks(testFile);
  }
}

export { ZestRuntime };
