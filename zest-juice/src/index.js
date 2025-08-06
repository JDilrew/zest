import { matchers } from "@heritage/zest-matchers";
import { EventEmitter } from "./emitter.js";

// Hierarchical test registry
const rootSuite = {
  name: "",
  tests: [],
  suites: [],
  hooks: { beforeAll: [], afterAll: [], beforeEach: [], afterEach: [] },
};
let currentSuite = rootSuite;

function suite(name, fn) {
  const s = {
    name,
    tests: [],
    suites: [],
    hooks: { beforeAll: [], afterAll: [], beforeEach: [], afterEach: [] },
  };
  currentSuite.suites.push(s);
  const prevSuite = currentSuite;
  currentSuite = s;
  fn();
  currentSuite = prevSuite;
}
function test(name, fn) {
  currentSuite.tests.push({ name, fn });
}
function beforeAll(fn) {
  currentSuite.hooks.beforeAll.push(fn);
}
function afterAll(fn) {
  currentSuite.hooks.afterAll.push(fn);
}
function beforeEach(fn) {
  currentSuite.hooks.beforeEach.push(fn);
}
function afterEach(fn) {
  currentSuite.hooks.afterEach.push(fn);
}

// Expose globals (suite-style only)
global.suite = suite;
global.test = test;
global.beforeAll = beforeAll;
global.afterAll = afterAll;
global.beforeEach = beforeEach;
global.afterEach = afterEach;

global.expect = matchers;

// Recursively run a suite
async function runSuite(suite, emitter) {
  for (const hook of suite.hooks.beforeAll) await hook();
  for (const childSuite of suite.suites) {
    await runSuite(childSuite, emitter);
  }
  for (const test of suite.tests) {
    for (const hook of suite.hooks.beforeEach) await hook();
    try {
      await test.fn();
      emitter.emit("test_success", suite.name, test.name);
    } catch (err) {
      emitter.emit("test_failure", suite.name, test.name, err);
    }
    for (const hook of suite.hooks.afterEach) await hook();
  }
  for (const hook of suite.hooks.afterAll) await hook();
}

// Main entry: run the root suite
async function run() {
  const emitter = new EventEmitter();
  emitter.emit("test_start");
  await runSuite(rootSuite, emitter);
  emitter.emit("test_end");
  emitter.removeAllListeners();
}

function resetTestState() {
  rootSuite.name = "";
  rootSuite.tests = [];
  rootSuite.suites = [];
  rootSuite.hooks = {
    beforeAll: [],
    afterAll: [],
    beforeEach: [],
    afterEach: [],
  };
  currentSuite = rootSuite;
}

export {
  run,
  suite,
  test,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  matchers as expect,
  resetTestState,
};
