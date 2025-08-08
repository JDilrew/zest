// Minimal global result collector
if (!globalThis.__zestResults__) globalThis.__zestResults__ = [];

const matchers = function (received) {
  return {
    toBe(expected) {
      try {
        if (received !== expected) {
          throw new Error(`Expected ${received} to be ${expected}`);
        }
        globalThis.__zestResults__.push({
          matcher: "toBe",
          status: "passed",
          testName: globalThis.__zestCurrentTestName__,
          suiteNames: globalThis.__zestCurrentSuiteNames__,
        });
      } catch (e) {
        globalThis.__zestResults__.push({
          matcher: "toBe",
          status: "failed",
          error: e.message,
          testName: globalThis.__zestCurrentTestName__,
          suiteNames: globalThis.__zestCurrentSuiteNames__,
        });
        throw e;
      }
    },
    toEqual(expected) {
      try {
        if (JSON.stringify(received) !== JSON.stringify(expected)) {
          throw new Error(
            `Expected ${JSON.stringify(received)} to equal ${JSON.stringify(
              expected
            )}`
          );
        }
        globalThis.__zestResults__.push({
          matcher: "toEqual",
          status: "passed",
          testName: globalThis.__zestCurrentTestName__,
          suiteNames: globalThis.__zestCurrentSuiteNames__,
        });
      } catch (e) {
        globalThis.__zestResults__.push({
          matcher: "toEqual",
          status: "failed",
          error: e.message,
          testName: globalThis.__zestCurrentTestName__,
          suiteNames: globalThis.__zestCurrentSuiteNames__,
        });
        throw e;
      }
    },
    toBeTruthy() {
      try {
        if (!received) {
          throw new Error(`Expected value to be truthy, but got ${received}`);
        }
        globalThis.__zestResults__.push({
          matcher: "toBeTruthy",
          status: "passed",
          testName: globalThis.__zestCurrentTestName__,
          suiteNames: globalThis.__zestCurrentSuiteNames__,
        });
      } catch (e) {
        globalThis.__zestResults__.push({
          matcher: "toBeTruthy",
          status: "failed",
          error: e.message,
          testName: globalThis.__zestCurrentTestName__,
          suiteNames: globalThis.__zestCurrentSuiteNames__,
        });
        throw e;
      }
    },
    toThrow(expectedError) {
      let errorThrown = false;
      try {
        received();
      } catch (e) {
        errorThrown = true;
        if (expectedError && e.message !== expectedError) {
          globalThis.__zestResults__.push({
            matcher: "toThrow",
            status: "failed",
            error: e.message,
            testName: globalThis.__zestCurrentTestName__,
            suiteNames: globalThis.__zestCurrentSuiteNames__,
          });
          throw new Error(
            `Expected error message "${e.message}" to be "${expectedError}"`
          );
        }
      }
      if (!errorThrown) {
        globalThis.__zestResults__.push({
          matcher: "toThrow",
          status: "failed",
          error: "No error thrown",
          testName: globalThis.__zestCurrentTestName__,
          suiteNames: globalThis.__zestCurrentSuiteNames__,
        });
        throw new Error(`Expected function to throw an error, but it did not`);
      }
      globalThis.__zestResults__.push({
        matcher: "toThrow",
        status: "passed",
        testName: globalThis.__zestCurrentTestName__,
        suiteNames: globalThis.__zestCurrentSuiteNames__,
      });
    },
    notToThrow(expectedError) {
      let errorThrown = false;
      try {
        received();
      } catch (e) {
        errorThrown = true;
        if (!expectedError || e.message === expectedError) {
          globalThis.__zestResults__.push({
            matcher: "notToThrow",
            status: "failed",
            error: e.message,
            testName: globalThis.__zestCurrentTestName__,
            suiteNames: globalThis.__zestCurrentSuiteNames__,
          });
          throw new Error(
            expectedError
              ? `Expected function not to throw "${expectedError}", but it did`
              : `Expected function not to throw an error, but it did: ${e.message}`
          );
        }
      }
      if (errorThrown) {
        globalThis.__zestResults__.push({
          matcher: "notToThrow",
          status: "failed",
          error: "Function threw an error",
          testName: globalThis.__zestCurrentTestName__,
          suiteNames: globalThis.__zestCurrentSuiteNames__,
        });
        throw new Error(`Expected function not to throw an error, but it did`);
      }
      globalThis.__zestResults__.push({
        matcher: "notToThrow",
        status: "passed",
        testName: globalThis.__zestCurrentTestName__,
        suiteNames: globalThis.__zestCurrentSuiteNames__,
      });
    },
    toHaveProperties(expected) {
      try {
        for (const key in expected) {
          if (!(key in received)) {
            throw new Error(`Expected object to have property "${key}"`);
          }
          if (received[key] !== expected[key]) {
            throw new Error(
              `Expected property "${key}" to be ${expected[key]}, but got ${received[key]}`
            );
          }
        }
        globalThis.__zestResults__.push({
          matcher: "toHaveProperties",
          status: "passed",
          testName: globalThis.__zestCurrentTestName__,
          suiteNames: globalThis.__zestCurrentSuiteNames__,
        });
      } catch (e) {
        globalThis.__zestResults__.push({
          matcher: "toHaveProperties",
          status: "failed",
          error: e.message,
          testName: globalThis.__zestCurrentTestName__,
          suiteNames: globalThis.__zestCurrentSuiteNames__,
        });
        throw e;
      }
    },
    toHaveBeenCalledWith(...expectedArgs) {
      try {
        if (typeof received !== "function" || !Array.isArray(received.calls)) {
          throw new Error(
            "Received value is not a spy function with call tracking"
          );
        }

        const matched = received.calls.some((call) => {
          return (
            call.args.length === expectedArgs.length &&
            call.args.every((arg, index) => arg === expectedArgs[index])
          );
        });

        if (!matched) {
          throw new Error(
            `Expected function to be called with ${JSON.stringify(
              expectedArgs
            )}, but it wasn't`
          );
        }

        globalThis.__zestResults__.push({
          matcher: "toHaveBeenCalledWith",
          status: "passed",
          testName: globalThis.__zestCurrentTestName__,
          suiteNames: globalThis.__zestCurrentSuiteNames__,
        });
      } catch (e) {
        globalThis.__zestResults__.push({
          matcher: "toHaveBeenCalledWith",
          status: "failed",
          error: e.message,
          testName: globalThis.__zestCurrentTestName__,
          suiteNames: globalThis.__zestCurrentSuiteNames__,
        });
        throw e;
      }
    },
  };
};

export { matchers };
