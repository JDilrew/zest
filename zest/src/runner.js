import { suites } from "./index.js";
import { formatTime } from "./utils.js";
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

// Export run for CLI
export { run };
