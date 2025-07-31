import { JsdomEnvironment, NodeEnvironment } from "@heritage/zest-environment";
import { ZestResolver } from "@heritage/zest-resolvers";
import { ZestRuntime } from "@heritage/zest-runtime";

// Simple event emitter for reporting
class EventEmitter {
  constructor() {
    this.listeners = {};
  }
  on(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }
  emit(event, ...args) {
    if (this.listeners[event]) {
      for (const fn of this.listeners[event]) fn(...args);
    }
  }

  // Remove all listeners for all events
  removeAllListeners() {
    this.listeners = {};
  }
}

// EXCERPT-FROM-JEST; Keeping the core of "runTest" as a separate function (as "runTestInternal")
// is key to be able to detect memory leaks. Since all variables are local to
// the function, when "runTestInternal" finishes its execution, they can all be
// freed, UNLESS something else is leaking them (and that's why we can detect
// the leak!).
async function runTestInternal(config, testFile) {
  try {
    // Import and run the test engine (zest-juice by default)
    // const runner =
    //   config.testRunner === "juice"
    //     ? "@heritage/zest-juice"
    //     : config.testRunner;
    // const { run } = await import(runner);

    // Setup environment
    const environment =
      config.environment === "jsdom"
        ? new JsdomEnvironment()
        : new NodeEnvironment();
    await environment.setup();

    // Setup module resolver
    const resolver = new ZestResolver(config.rootDir);

    // Setup runtime and inject environment
    const runtime = new ZestRuntime(config.testRunner, environment, resolver);
    const run = await runtime.setupTestGlobals();
    console.log("Step runner-1");

    // can import setup files into the runtime if needed here.

    // Create emitter and attach listeners BEFORE running tests
    const matcherResults = [];
    let failed = false;
    const emitter = new EventEmitter();
    emitter.on &&
      emitter.on("test_success", (suiteName, testName) => {
        matcherResults.push({
          suiteName,
          testName,
          status: "passed",
        });
      });
    emitter.on &&
      emitter.on("test_failure", (suiteName, testName, error) => {
        matcherResults.push({
          suiteName,
          testName,
          status: "failed",
          error: error?.message || error,
        });
        failed = true;
      });

    // Runtime loads the test file (with mocks applied)
    await runtime.loadTestFile(testFile);
    console.log("Step runner-2");

    let result;
    // Run the test suite using the runner, passing the emitter
    try {
      console.log("Step runner-3");
      result = await run(emitter);
    } catch (error) {
      throw error;
    }

    // Teardown environment
    await environment.teardown();

    runtime.teardown();

    // Remove all listeners to prevent leaks
    emitter.removeAllListeners();

    // Return a simple result object
    return {
      success: !failed,
      errorMessage: undefined,
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
  // detect leaks after the fact

  console.log("Step runner-4");

  return result;
}

export { run };
