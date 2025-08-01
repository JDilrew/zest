import { TestRunner } from "@heritage/zest-runner";
import {
  reportGlobalStart,
  reportContextStart,
  reportResults,
} from "@heritage/zest-reporters";

async function scheduleTests(testContexts) {
  let results = [];

  reportGlobalStart();

  for (const tests of testContexts) {
    //TODO: Config handling, either logging debug mode or specifics for reporting.
    if (testContexts.length > 1) {
      reportContextStart(tests.context);
    }

    const runner = new TestRunner();
    const result = await runner.runTests(tests.files, undefined, tests.config);

    reportResults(result);
    results.push(result);
  }

  return results;
}

export { scheduleTests };
