import { Worker } from "@heritage/zest-worker";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";

// EXCERPT-FROM-JEST; Keeping the core of "runTest" as a separate function (as "runTestInternal")
// is key to be able to detect memory leaks. Since all variables are local to
// the function, when "runTestInternal" finishes its execution, they can all be
// freed, UNLESS something else is leaking them (and that's why we can detect
// the leak!).
async function runTestInternal(config, testFile) {
  //TODO: This should be inside runner.js and that work should be moved to index.js...
  try {
    // Import and run the test engine (zest-juice by default)
    const runner =
      config.testRunner === "juice"
        ? "@heritage/zest-juice"
        : config.testRunner;
    const { run } = await import(runner);

    // setup environment
    // let env;
    // if (config.testEnvironment === "jsdom") {
    //   const { JsdomEnvironment } = await import(
    //     "@heritage/zest-environment/jsdomEnvironment"
    //   );
    //   env = new JsdomEnvironment();
    // } else {
    //   const { NodeEnvironment } = await import(
    //     "@heritage/zest-environment/nodeEnvironment"
    //   );
    //   env = new NodeEnvironment();
    // }
    // await env.setup();

    // Import the test file so it registers its suites/tests
    await import(pathToFileURL(testFile).href);

    // Run the test suite using the runner
    const emitter = await run();

    // await env.teardown();

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

async function run(config, testFile) {
  const result = await runTestInternal(config, testFile);
  // detect leaks

  return result;
}

export { run };
