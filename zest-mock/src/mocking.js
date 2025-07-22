// Simple mocking registry
const mocks = {};

/**
 * Register a mock for a module.
 * @param {string} moduleName - The module to mock.
 * @param {*} mockImpl - The mock implementation.
 */
function mock(moduleName, mockImpl) {
  mocks[moduleName] = mockImpl;
}

function spyOn(object, methodName) {
  if (!object || typeof object[methodName] !== "function") {
    throw new Error(`Cannot spy on ${methodName} of ${object}`);
  }
  const originalMethod = object[methodName];
  const spy = function (...args) {
    spy.calls.push(args);
    return originalMethod.apply(this, args);
  };
  spy.calls = [];
  object[methodName] = spy;
  return {
    restore: () => {
      object[methodName] = originalMethod;
    },
    getCalls: () => spy.calls,
  };
}

import { createRequire } from "module";
const require = createRequire(import.meta.url);

/**
 * Apply mocks by patching require.
 */
function applyMocks() {
  const Module = require("module");
  const originalRequire = Module.prototype.require;
  Module.prototype.require = function (path) {
    if (mocks[path]) {
      return mocks[path];
    }
    return originalRequire.apply(this, arguments);
  };
}

export { mock, spyOn, applyMocks };
