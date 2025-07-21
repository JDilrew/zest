import { matchers } from "@heritage/zest-matchers";
import { mock } from "@heritage/zest-mock";
import { suite, test } from "@heritage/zest-runner";

// Expose globals
global.suite = suite;
global.test = test;
global.expect = matchers;
global.zest = {
  mock,
};
