import { TestRunner } from "@heritage/zest-runner";
import {
  reportGlobalStart,
  reportContextStart,
  reportResult,
  reportSummary,
} from "@heritage/zest-reporters";
import { loadConfig } from "@heritage/zest-config";

async function scheduleTests(testContexts, silent) {
  let results = [];

  reportGlobalStart(silent);

  for (const tests of testContexts) {
    if (testContexts.length > 1) {
      reportContextStart(tests.context);
    }

    const config = await loadConfig(tests.config || {});

    const watcher = (result) => {
      reportResult(result, config, silent);
    };

    const runner = new TestRunner();
    const results = await runner.runTests(tests.files, config, watcher);

    reportSummary(results, config, silent);
    results.push(results);
  }

  return results;
}

export { scheduleTests };
