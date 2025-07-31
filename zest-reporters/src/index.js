import chalk from "chalk";

function reportStart() {
  console.log(chalk.bold.yellow("---\n"));
  console.log(chalk.bold.yellow("🍋 Running tests...\n"));
  console.log(chalk.bold.yellow("---\n"));
}

function reportResults(results) {
  // Print per-file results
  results.forEach(({ file, success, errorMessage, matcherResults }) => {
    const status = success
      ? chalk.green.inverse.bold(" PASS ")
      : chalk.red.inverse.bold(" FAIL ");
    console.log(status + " " + chalk.dim(file));

    if (!success && errorMessage) {
      console.log("  " + errorMessage);
    }

    // matcherResults.forEach((result) => {
    //   console.log(file, result);
    // });

    // Print matcher results grouped by testFile
    // if (matcherResults && matcherResults.length > 0) {
    //   const fileGroups = matcherResults.reduce((acc, result) => {
    //     const key = result.testFile;
    //     if (!acc[key]) acc[key] = [];
    //     acc[key].push(result);
    //     return acc;
    //   }, {});

    //   Object.entries(fileGroups).forEach(([testFile, results]) => {
    //     const suiteGroups = results.reduce((acc, result) => {
    //       const suiteKey = result.suiteName || "";
    //       if (!acc[suiteKey]) acc[suiteKey] = [];
    //       acc[suiteKey].push(result);
    //       return acc;
    //     }, {});

    //     Object.entries(suiteGroups).forEach(([suiteName, results]) => {
    //       if (suiteName) {
    //         console.log(chalk.bold(`\n  > ${suiteName}`));
    //       }

    //       results.forEach((result) => {
    //         const icon =
    //           result.status === "passed" ? chalk.green("✓") : chalk.red("✗");
    //         let msg = `    ${icon}`;
    //         if (result.matcher) msg += ` ${result.matcher}`;
    //         if (result.testName) {
    //           msg += ` ${chalk.cyan(result.testName)}`;
    //         }
    //         if (result.status === "failed" && result.error) {
    //           msg += `: ${chalk.red(result.error)}`;
    //         }
    //         console.log(msg);
    //       });
    //     });
    //   });

    //   // let lastSuite = null;
    //   // matcherResults.forEach((result) => {
    //   //   const suiteLabel = result.suiteName ? result.suiteName : "";
    //   //   if (suiteLabel && suiteLabel !== lastSuite) {
    //   //     console.log(chalk.bold(`  > ${suiteLabel}`));
    //   //     lastSuite = suiteLabel;
    //   //   }
    //   //   const icon =
    //   //     result.status === "passed" ? chalk.green("✓") : chalk.red("✗");
    //   //   let msg = `    ${icon}`;
    //   //   if (result.matcher) msg += ` ${result.matcher}`;
    //   //   if (result.testName) {
    //   //     msg += ` ${chalk.cyan(result.testName)}`;
    //   //   }
    //   //   if (result.status === "failed" && result.error) {
    //   //     msg += `: ${chalk.red(result.error)}`;
    //   //   }
    //   //   console.log(msg);
    //   // });
    // }
  });

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
    chalk.bold(`Ran: ${suiteSet.size} suites, ${testSet.size} tests`)
  );
  console.log(
    chalk.green.bold(`Passed: ${passedSuites} suites, ${passedTests} tests`)
  );
  console.log(
    chalk.red.bold(`Failed: ${failedSuites} suites, ${failedTests} tests`)
  );
  console.log(chalk.bold.yellow("\n---\n"));
}

export { reportStart, reportResults };
