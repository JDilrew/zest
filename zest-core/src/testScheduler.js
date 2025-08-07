import { TestRunner } from "@heritage/zest-runner";
import {
  reportGlobalStart,
  reportContextStart,
  reportResults,
} from "@heritage/zest-reporters";
import { loadConfig } from "@heritage/zest-config";

async function scheduleTests(testContexts) {
  let results = [];

  reportGlobalStart();

  for (const tests of testContexts) {
    //TODO: Config handling, either logging debug mode or specifics for reporting.
    if (testContexts.length > 1) {
      reportContextStart(tests.context);
    }

    const config = await loadConfig(tests.config || {});

    const runner = new TestRunner();
    const result = await runner.runTests(tests.files, undefined, config);

    // console.warn("Temp res out:");
    // console.log(JSON.stringify(result, null, 2));

    reportResults(result);
    results.push(result);
  }

  return results;
}

export { scheduleTests };
