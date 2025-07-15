import { promises } from "fs";
import { pathToFileURL } from "url";

import "./index.js";
import "./matchers.js";

import { suites } from "./index.js";

export async function runTest(testFile) {
  // Reset results for each test file
  globalThis.__zestResults__ = [];
  // Clear suites array for each test file
  suites.length = 0;
  const testResult = {
    success: true,
    errorMessage: null,
    matcherResults: [],
  };
  try {
    await import(pathToFileURL(testFile).href);
    // Run all registered tests
    for (const suite of suites) {
      for (const childSuite of suite.children || []) {
        for (const test of childSuite.tests || []) {
          try {
            test.testFn();
          } catch (e) {
            testResult.success = false;
          }
        }
      }
      for (const test of suite.tests || []) {
        try {
          test.testFn();
        } catch (e) {
          testResult.success = false;
        }
      }
    }
  } catch (error) {
    testResult.success = false;
    testResult.errorMessage = error.message;
  }
  testResult.matcherResults = globalThis.__zestResults__ || [];
  return testResult;
}
