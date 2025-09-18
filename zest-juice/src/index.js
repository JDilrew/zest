import { matchers } from "@jdilrew/zest-matchers";
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

// Recursively run a suite — with path + proper ordering
async function runSuite(suite, emitter, ancestors = []) {
  const suitePath = suite.name
    ? [...ancestors.map((s) => s.name).filter(Boolean), suite.name]
    : ancestors.map((s) => s.name).filter(Boolean);

  emitter.emit("suite_start", suitePath); // e.g. [] for root, ["depth 1", "depth 2"]

  // Per-suite beforeAll
  for (const hook of suite.hooks.beforeAll) await hook();

  // 1) Root-level tests FIRST
  for (const test of suite.tests) {
    // beforeEach: outer -> inner
    for (const s of [...ancestors, suite]) {
      for (const hook of s.hooks.beforeEach) await hook();
    }

    try {
      await test.fn();
      emitter.emit("test_success", suitePath, test.name);
    } catch (err) {
      emitter.emit("test_failure", suitePath, test.name, err);
    }

    // afterEach: inner -> outer
    for (const s of [suite, ...ancestors].reverse()) {
      for (const hook of s.hooks.afterEach) await hook();
    }
  }

  // 2) Then child suites
  for (const childSuite of suite.suites) {
    await runSuite(childSuite, emitter, [...ancestors, suite]);
  }

  // Per-suite afterAll
  for (const hook of suite.hooks.afterAll) await hook();

  emitter.emit("suite_end", suitePath);
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
