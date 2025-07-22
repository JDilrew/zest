import { pathToFileURL } from "url";

export async function runTest([config, testFile]) {
  try {
    // Import and run the test engine (zest-juice by default)
    const runner =
      config.testRunner === "juice"
        ? "@heritage/zest-juice"
        : config.testRunner;
    const { run } = await import(runner);

    // Import the test file so it registers its suites/tests
    await import(pathToFileURL(testFile).href);

    // Run the test suite using the runner
    const emitter = await run();

    // Collect test results from emitter events
    const matcherResults = [];
    let failed = false;
    let errorMessage = null;
    emitter.on("test_success", (testName) => {
      matcherResults.push({ testName, status: "passed" });
    });
    emitter.on("test_failure", (testName, error) => {
      matcherResults.push({
        testName,
        status: "failed",
        error: error?.message || error,
      });
      failed = true;
      if (!errorMessage) errorMessage = error?.message || String(error);
    });

    // Return a simple result object
    return {
      success: !failed,
      errorMessage,
      matcherResults,
    };
  } catch (error) {
    return {
      success: false,
      errorMessage: error.message,
      matcherResults: [],
    };
  }
}
