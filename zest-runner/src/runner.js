import { JsdomEnvironment, NodeEnvironment } from "@heritage/zest-environment";
import { ZestResolver } from "@heritage/zest-resolvers";
import { ZestRuntime } from "@heritage/zest-runtime";
import { SilentConsole, BufferConsole } from "@heritage/zest-console";

// EXCERPT-FROM-JEST; Keeping the core of "runTest" as a separate function (as "runTestInternal")
// is key to be able to detect memory leaks. Since all variables are local to
// the function, when "runTestInternal" finishes its execution, they can all be
// freed, UNLESS something else is leaking them (and that's why we can detect
// the leak!).
async function runTestInternal(config, testFile) {
  try {
    // Setup environment
    const environment =
      config.environment === "jsdom"
        ? new JsdomEnvironment()
        : new NodeEnvironment();
    await environment.setup();

    // Setup console for monkey patching
    let testConsole;
    if (config.silent) {
      testConsole = new SilentConsole();
    } else {
      testConsole = new BufferConsole();
    }

    // attach it to the environment
    environment.global.console = testConsole;

    // Setup module resolver
    const resolver = new ZestResolver(config.rootDir);

    // Setup runtime and inject environment
    const runtime = new ZestRuntime(config.testRunner, environment, resolver);

    try {
      const run = await runtime.setupTestGlobals();

      // Runtime loads the test file (with mocks applied)
      await runtime.loadTestFile(testFile);

      await run();
    } catch (error) {
      throw error;
    } finally {
      // Teardown environment before returning error
      await environment.teardown();
      runtime.teardown();

      // TODO: freezeConsole();
    }

    return {
      console: testConsole.getBuffer(),
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

  return result;
}

export { run };
