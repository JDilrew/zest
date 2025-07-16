import chalk from "chalk";
import { Worker } from "@heritage/zest-worker";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { relative } from "path";

async function run(testFiles, silent = false) {
  const root = dirname(fileURLToPath(import.meta.url));

  const workerPath = pathToFileURL(join(root, "./worker.js")).href;
  const worker = new Worker(workerPath, { useThreads: false });
  await worker.initialize();

  console.log(chalk.bold.yellow("---\n"));
  console.log(chalk.bold.yellow("🍋 Running tests...\n"));
  console.log(chalk.bold.yellow("---\n"));

  // Collect all matcher results for summary
  const allMatcherResults = [];
  await Promise.all(
    Array.from(testFiles).map(async (file) => {
      // ship this off to a parallel worker
      const { success, errorMessage, matcherResults } = await worker.runTest(
        file
      );
      allMatcherResults.push(...matcherResults);

      const status = success
        ? chalk.green.inverse.bold(" PASS ")
        : chalk.red.inverse.bold(" FAIL ");

      console.log(status + " " + chalk.dim(relative(root, file)));
      if (!success && errorMessage) {
        console.log("  " + errorMessage);
      }

      // Print matcher results grouped by suite
      if (matcherResults && matcherResults.length > 0) {
        let lastSuite = null;
        matcherResults.forEach((result, idx) => {
          const suiteLabel = result.suiteNames
            ? result.suiteNames.join(" > ")
            : "";
          if (suiteLabel && suiteLabel !== lastSuite) {
            console.log(chalk.bold(`  Suite: ${suiteLabel}`));
            lastSuite = suiteLabel;
          }
          const icon =
            result.status === "passed" ? chalk.green("✓") : chalk.red("✗");
          let msg = `    ${icon} ${result.matcher}`;
          if (result.testName) {
            msg += ` ${chalk.cyan(result.testName)}`;
          }
          if (result.status === "failed" && result.error) {
            msg += `: ${chalk.red(result.error)}`;
          }
          console.log(msg);
        });
      }
    })
  );

  // Summary
  const suiteStatus = {};
  const testStatus = {};
  const suiteSet = new Set();
  const testSet = new Set();
  allMatcherResults.forEach((result) => {
    const suiteKey = result.suiteNames
      ? result.suiteNames.join(" > ")
      : "(no suite)";
    const testKey = result.testName
      ? `${suiteKey}::${result.testName}`
      : undefined;
    if (result.suiteNames) suiteSet.add(suiteKey);
    if (result.testName) testSet.add(testKey);
    // Track suite status
    if (suiteKey) {
      if (!suiteStatus[suiteKey])
        suiteStatus[suiteKey] = { passed: 0, failed: 0 };
      if (result.status === "passed") suiteStatus[suiteKey].passed++;
      if (result.status === "failed") suiteStatus[suiteKey].failed++;
    }
    // Track test status
    if (testKey) {
      if (!testStatus[testKey]) testStatus[testKey] = { passed: 0, failed: 0 };
      if (result.status === "passed") testStatus[testKey].passed++;
      if (result.status === "failed") testStatus[testKey].failed++;
    }
  });

  // Count passed/failed suites and tests
  let passedSuites = 0,
    failedSuites = 0;
  let passedTests = 0,
    failedTests = 0;
  for (const suiteKey of suiteSet) {
    if (suiteStatus[suiteKey].failed === 0 && suiteStatus[suiteKey].passed > 0)
      passedSuites++;
    else failedSuites++;
  }
  for (const testKey of testSet) {
    if (testStatus[testKey].failed === 0 && testStatus[testKey].passed > 0)
      passedTests++;
    else failedTests++;
  }
  console.log(chalk.bold.yellow("\n--- SUMMARY ---"));
  console.log(
    chalk.bold(`Ran: ${suiteSet.size} suites, ${testSet.size} tests`)
  );
  console.log(
    chalk.green.bold(`Passed: ${passedSuites} suites, ${passedTests} tests`)
  );
  console.log(
    chalk.red.bold(`Failed: ${failedSuites} suites, ${failedTests} tests`)
  );
}

export { run };
