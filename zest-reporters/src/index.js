import chalk from "chalk";
import { getConsoleOutput } from "@heritage/zest-console";

const orange = chalk.hex("#FFA500");

function reportGlobalStart(silent) {
  console.log(chalk.bold.yellow("---\n"));
  console.log(
    chalk.bold.yellow(`🍋 Running tests${silent ? " silently" : ""}...\n`)
  );
  console.log(chalk.bold.yellow("---\n"));
}

function reportContextStart(context) {
  console.log(chalk.bold.inverse.yellow(context) + "\n");
}

function reportResult(result, config, silent) {
  const {
    file,
    success,
    errorMessage,
    matcherResults,
    result: resultReport,
  } = result;

  const status = success
    ? chalk.green.inverse.bold(" PASS ")
    : orange.inverse.bold(" FAIL ");
  if (!silent) {
    console.log("\n");
  }
  console.log(status + " " + chalk.dim(file));

  if (!success && errorMessage) {
    console.log("  " + errorMessage);
  }

  // matcherResults.forEach((result) => {
  //   console.log(file, result);
  // });

  // Print matcher results grouped by testFile
  if (!silent && matcherResults && matcherResults.length > 0) {
    const fileGroups = matcherResults.reduce((acc, result) => {
      const key = result.testFile;
      if (!acc[key]) acc[key] = [];
      acc[key].push(result);
      return acc;
    }, {});

    Object.entries(fileGroups).forEach(([testFile, results]) => {
      const suiteGroups = results.reduce((acc, result) => {
        const suiteKey = result.suiteName || "";
        if (!acc[suiteKey]) acc[suiteKey] = [];
        acc[suiteKey].push(result);
        return acc;
      }, {});

      const entries = Object.entries(suiteGroups);

      // Split into root (no suite name) and named suites
      const rootEntry = entries.find(([suiteName]) => !suiteName);
      const namedEntries = entries.filter(([suiteName]) => !!suiteName);

      const printGroup = ([suiteName, results]) => {
        let indent = "  ";
        if (suiteName) {
          console.log(`  ${suiteName}`);
          indent = "    ";
        }

        results.forEach((result) => {
          const icon =
            result.status === "passed" ? chalk.green("√") : orange("X");
          let message = indent + icon;
          if (result.matcher) message += ` ${result.matcher}`;
          if (result.testName) message += ` ${chalk.gray(result.testName)}`;
          if (result.status === "failed" && result.error) {
            message += ` ${orange(result.error)}`;
          }
          console.log(message);
        });
      };

      // 1) root-level first (no suite header)
      if (rootEntry) printGroup(rootEntry);

      // 2) then all named suites
      namedEntries.forEach(printGroup);
    });

    // let lastSuite = null;
    // matcherResults.forEach((result) => {
    //   const suiteLabel = result.suiteName ? result.suiteName : "";
    //   if (suiteLabel && suiteLabel !== lastSuite) {
    //     console.log(chalk.bold(`  > ${suiteLabel}`));
    //     lastSuite = suiteLabel;
    //   }
    //   const icon =
    //     result.status === "passed" ? chalk.green("✓") : chalk.red("✗");
    //   let message = `    ${icon}`;
    //   if (result.matcher) message += ` ${result.matcher}`;
    //   if (result.testName) {
    //     message += ` ${chalk.cyan(result.testName)}`;
    //   }
    //   if (result.status === "failed" && result.error) {
    //     message += `: ${chalk.red(result.error)}`;
    //   }
    //   console.log(message);
    // });
  }

  // console pipe
  if (resultReport?.console) {
    console.log("\nConsole output:\n");
    console.log(getConsoleOutput(resultReport.console));
  }
}

function reportSummary(results, config, silent) {
  // Summary
  const suiteStatus = {};
  const testStatus = {};
  const suiteSet = new Set();
  const testSet = new Set();
  results.forEach(({ matcherResults }) => {
    (matcherResults || []).forEach((result) => {
      const suiteKey =
        result.suiteName && result.suiteName.trim() !== ""
          ? result.suiteName
          : null;
      const testKey = result.testName
        ? `${suiteKey || "(no suite)"}::${result.testName}`
        : undefined;
      if (suiteKey) suiteSet.add(suiteKey);
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
        if (!testStatus[testKey])
          testStatus[testKey] = { passed: 0, failed: 0 };
        if (result.status === "passed") testStatus[testKey].passed++;
        if (result.status === "failed") testStatus[testKey].failed++;
      }
    });
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
  console.log(chalk.bold.yellow("\n--- SUMMARY ---\n"));
  console.log(
    chalk.bold(
      `Ran: ${suiteSet.size} suites, ${testSet.size} tests, across ${results.length} files`
    )
  );
  console.log(
    chalk.green.bold(`Passed: ${passedSuites} suites, ${passedTests} tests`)
  );
  console.log(
    orange.bold(`Failed: ${failedSuites} suites, ${failedTests} tests`)
  );
  console.log(chalk.bold.yellow("\n---\n"));
}

export { reportGlobalStart, reportContextStart, reportResult, reportSummary };
