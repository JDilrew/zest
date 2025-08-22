const matchers = function (received) {
  return {
    toBe(expected) {
      if (received !== expected) {
        throw new Error(`Expected ${received} to be ${expected}`);
      }
    },

    toEqual(expected) {
      if (JSON.stringify(received) !== JSON.stringify(expected)) {
        throw new Error(
          `Expected ${JSON.stringify(received)} to equal ${JSON.stringify(
            expected
          )}`
        );
      }
    },

    toBeTruthy() {
      if (!received) {
        throw new Error(`Expected value to be truthy, but got ${received}`);
      }
    },

    toThrow(expectedError) {
      let errorThrown = false;
      try {
        received();
      } catch (e) {
        errorThrown = true;
        if (expectedError && e.message !== expectedError) {
          throw new Error(
            `Expected error message "${e.message}" to be "${expectedError}"`
          );
        }
      }
      if (!errorThrown) {
        throw new Error(`Expected function to throw an error, but it did not`);
      }
    },

    notToThrow(expectedError) {
      let errorThrown = false;
      try {
        received();
      } catch (e) {
        errorThrown = true;
        if (!expectedError || e.message === expectedError) {
          throw new Error(
            expectedError
              ? `Expected function not to throw "${expectedError}", but it did`
              : `Expected function not to throw an error, but it did`
          );
        }
      }
      if (errorThrown) {
        throw new Error(`Expected function not to throw an error, but it did`);
      }
    },

    toHaveProperties(expected) {
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
    },

    toHaveBeenCalledWith(...expectedArgs) {
      if (typeof received !== "function" || !Array.isArray(received.calls)) {
        throw new Error(
          "Received value is not a spy function with call tracking"
        );
      }

      const matched = received.calls.some((call) => {
        return (
          call.length === expectedArgs.length &&
          call.every((arg, index) => arg === expectedArgs[index])
        );
      });

      if (!matched) {
        throw new Error(
          `Expected function to be called with ${JSON.stringify(
            expectedArgs
          )}, but it wasn't`
        );
      }
    },
  };
};

export { matchers };
