import { matchers } from "@heritage/zest-matchers";
import { mock } from "@heritage/zest-mock";

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

function suite(name, fn) {
  const suite = { name, type: "suite", tests: [], children: [] };
  const parent = currentSuite || getOrCreateFileSuite();
  parent.children.push(suite);
  const prevSuite = currentSuite;
  currentSuite = suite;
  fn();
  currentSuite = prevSuite;
}

function test(name, fn) {
  const parent = currentSuite || getOrCreateFileSuite();
  parent.tests.push({ testName: name, testFn: fn });
}
// Expose globals
global.suite = suite;
global.test = test;
global.expect = matchers;
global.zest = {
  mock,
};

export { suites, suite, test };
