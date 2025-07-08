import { suites } from "./index.js";
import chalk from "chalk";

function run({ silent = false } = {}) {
  console.log(chalk.bold.yellow("---\n"));
  console.log(chalk.bold.yellow("🍋 Running tests...\n"));
  console.log(chalk.bold.yellow("---"));

  let suitesPassed = 0,
    suitesSkipped = 0,
    suitesFailed = 0;
  let passed = 0,
    skipped = 0,
    failed = 0;

  let startTime = Date.now();

  function runSuite(suite, indentLevel = 0) {
    const indent = "  ".repeat(indentLevel);
    if (suite.type !== "file") {
      console.log(indent + suite.name);
    } else {
      console.log("\n" + chalk.bold.cyan(suite.name));
    }
    let anyFailed = false;
    for (const test of suite.tests) {
      try {
        test.testFn();
        console.log(indent + chalk.green(`  ✓ ${test.testName}`));
        passed++;
      } catch (e) {
        console.log(indent + chalk.red(`  ✗ ${test.testName}`));
        if (!silent) {
          console.error(e);
        }
        anyFailed = true;
        failed++;
      }
    }
    for (const child of suite.children || []) {
      runSuite(child, indentLevel + 1);
    }
    return anyFailed;
  }

  for (const suite of suites) {
    const anyFailed = runSuite(suite, 0);
    if (!anyFailed) {
      suitesPassed++;
    } else {
      suitesFailed++;
    }
  }

  console.log("\n");

  let suiteSummary = chalk.bold.white("Suites: ");
  if (suitesPassed > 0)
    suiteSummary += chalk.inverse.bold.green(` ${suitesPassed} passed `);
  if (suitesSkipped > 0)
    suiteSummary += chalk.inverse.bold.yellow(` ${suitesSkipped} skipped `);
  if (suitesFailed > 0)
    suiteSummary += chalk.inverse.bold.red(` ${suitesFailed} failed `);
  console.log(suiteSummary);

  let testSummary = chalk.bold.white("Tests:  ");
  if (passed > 0) testSummary += chalk.inverse.bold.green(` ${passed} passed `);
  if (skipped > 0)
    testSummary += chalk.inverse.bold.yellow(` ${skipped} skipped `);
  if (failed > 0) testSummary += chalk.inverse.bold.red(` ${failed} failed `);
  console.log(testSummary);

  let endTime = Date.now();
  let timeTaken = endTime - startTime;
  console.log(chalk.bold("Time: " + formatTime(timeTaken)));

  console.log("\n");
}

function formatTime(ms) {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  if (ms < 60000) {
    return `${Math.floor(ms / 1000)}s`;
  }
  if (ms < 3600000) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }
  // For longer durations, show in hours and minutes
  const hours = Math.floor(ms / 3600000);
  const remainingMinutes = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${remainingMinutes}m`;
}

// Export run for CLI
export { run };
