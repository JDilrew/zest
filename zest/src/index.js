import { mock } from "./mocking.js";

const suites = [];
let currentSuite = null;
let fileSuites = {};

function getOrCreateFileSuite() {
  const file = global.__zestCurrentTestFile || "(unknown)";

  if (!fileSuites[file]) {
    const suite = { name: file, type: "file", tests: [], children: [] };
    suites.push(suite);
    fileSuites[file] = suite;
  }

  return fileSuites[file];
}

function basket(name, fn) {
  const suite = { name, type: "basket", tests: [], children: [] };
  const parent = currentSuite || getOrCreateFileSuite();
  parent.children.push(suite);
  const prevSuite = currentSuite;
  currentSuite = suite;
  fn();
  currentSuite = prevSuite;
}

function fruit(name, fn) {
  const suite = { name, type: "fruit", tests: [], children: [] };
  const parent = currentSuite || getOrCreateFileSuite();
  parent.children.push(suite);
  const prevSuite = currentSuite;
  currentSuite = suite;
  fn();
  currentSuite = prevSuite;
}

function squeeze(name, fn) {
  const parent = currentSuite || getOrCreateFileSuite();
  parent.tests.push({ testName: name, testFn: fn });
}

// Expose globals
global.basket = basket;
global.fruit = fruit;
global.squeeze = squeeze;

global.taste = function (received) {
  return {
    fitsNote(expected) {
      if (received !== expected) {
        throw new Error(`Expected ${received} to be ${expected}`);
      }
    },
    fitsProfile(expected) {
      if (JSON.stringify(received) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${received} to equal ${expected}`);
      }
    },
    isJuicy() {
      if (!received) {
        throw new Error(
          `Expected value to be juicy (truthy), but got ${received}`
        );
      }
    },
    isSour(expectedError) {
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
    isSweet(expectedError) {
      let errorThrown = false;
      try {
        received();
      } catch (e) {
        errorThrown = true;
        if (expectedError && e.message === expectedError) {
          throw new Error(
            `Expected function not to throw "${expectedError}", but it did`
          );
        }
      }
      if (errorThrown) {
        throw new Error(`Expected function not to throw an error, but it did`);
      }
    },
    hasNotesOf(expectedNotes) {
      if (!received.notes || !received.notes.includes(expectedNotes)) {
        throw new Error(
          `Expected ${received} to have notes of "${expectedNotes}"`
        );
      }
    },
    hasProfileOf(expectedHints) {
      if (
        typeof received !== "object" ||
        received === null ||
        typeof received.profile !== "object" ||
        received.profile === null
      ) {
        throw new Error(`Expected a fruit with a profile to compare`);
      }

      const actual = received.profile;

      for (const key in expectedHints) {
        if (!(key in actual)) {
          throw new Error(`Expected profile to include hint "${key}"`);
        }
        const expectedValue = expectedHints[key];
        const actualValue = actual[key];

        if (actualValue !== expectedValue) {
          throw new Error(
            `Expected profile hint "${key}" to be "${expectedValue}", but got "${actualValue}"`
          );
        }
      }
    },
  };
};

global.zest = {
  mock,
};

export { suites };
