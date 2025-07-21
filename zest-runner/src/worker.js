import { pathToFileURL } from "url";

// import "@heritage/zest-globals";
import { suites } from "@heritage/zest-globals";

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
    global.__zestCurrentTestFile = testFile;
    await import(pathToFileURL(testFile).href);

    // Run all registered tests
    function runSuite(suite, parentNames = []) {
      // const suiteNames =
      //   suite.type !== "file" ? [...parentNames, suite.name] : [];
      const suiteNames = [...parentNames, suite.name];

      for (const childSuite of suite.children || []) {
        runSuite(childSuite, suiteNames);
      }

      for (const test of suite.tests || []) {
        try {
          globalThis.__zestCurrentTestName__ = test.testName;
          globalThis.__zestCurrentSuiteNames__ = suiteNames;

          test.testFn();
        } catch (e) {
          testResult.success = false;
        } finally {
          globalThis.__zestCurrentTestName__ = undefined;
          globalThis.__zestCurrentSuiteNames__ = undefined;
        }
      }
    }

    for (const suite of suites) {
      runSuite(suite, []);
    }

    global.__zestCurrentTestFile = undefined;
  } catch (error) {
    testResult.success = false;
    testResult.errorMessage = error.message;
  }
  testResult.matcherResults = globalThis.__zestResults__ || [];
  return testResult;
}
