import chalk from "chalk";
import { getConsoleOutput } from "@heritage/zest-console";

const orange = chalk.hex("#FFA500");

// ---------- utils ----------
const isNonEmptyString = (val) => typeof val === "string" && val.trim() !== "";

const toPath = (r) => {
  // Prefer explicit suitePath array if present
  if (Array.isArray(r.suitePath)) {
    return r.suitePath.filter(isNonEmptyString).map((s) => s.trim());
  }
  // Some emitters may send suiteName as an array
  if (Array.isArray(r.suiteName)) {
    return r.suiteName.filter(isNonEmptyString).map((s) => s.trim());
  }
  // suiteName as a single string (possibly a comma-joined path)
  if (isNonEmptyString(r.suiteName)) {
    return r.suiteName
      .split(",")
      .map((s) => s.trim())
      .filter(isNonEmptyString);
  }
  // No suite info -> root tests
  return [];
};

const makeNode = () => ({ tests: [], children: new Map() });

const printTest = (result, depth) => {
  const indent = "  ".repeat(depth);
  const icon = result.status === "passed" ? chalk.green("√") : orange("X");
  let message = indent + icon;
  if (result.matcher) message += ` ${result.matcher}`;
  if (result.testName) message += ` ${chalk.gray(result.testName)}`;
  if (result.status === "failed" && result.error) {
    message += ` ${orange(result.error)}`;
  }
  console.log(message);
};

const printNode = (node, depth, label = null) => {
  // Print a suite header if this is a named node
  if (label) console.log(`${"  ".repeat(depth - 1)}${label}`);

  // 1) Tests at this level (root-first, no header for root)
  for (const t of node.tests) printTest(t, depth);

  // 2) Then recurse into children
  for (const [name, child] of node.children) {
    printNode(child, depth + 1, name);
  }
};

// ---------- public API ----------
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

  // Group + print matchers by file, then build a tree per file
  if (!silent && matcherResults && matcherResults.length > 0) {
    const fileGroups = matcherResults.reduce((acc, mr) => {
      const key = mr.testFile || "(unknown file)";
      if (!acc[key]) acc[key] = [];
      acc[key].push(mr);
      return acc;
    }, {});

    Object.entries(fileGroups).forEach(([testFile, results]) => {
      // Build a tree from normalized suite paths
      const root = makeNode();
      for (const r of results) {
        const path = toPath(r);
        let node = root;
        for (const name of path) {
          if (!node.children.has(name)) node.children.set(name, makeNode());
          node = node.children.get(name);
        }
        node.tests.push(r);
      }

      // Print tree with root tests first; start at depth 1 for a single indent
      printNode(root, 1);
    });
  }

  // Console output, if any
  if (resultReport?.console) {
    console.log("\nConsole output:\n");
    console.log(getConsoleOutput(resultReport.console));
  }
}

function reportSummary(results, config, silent) {
  // Aggregate suite/test pass-fail with robust normalization
  const suiteStatus = {};
  const testStatus = {};
  const suiteSet = new Set();
  const testSet = new Set();

  const suiteKeyFromResult = (r) => {
    // Prefer path array for key; else fall back to string; ignore empty
    const path = toPath(r);
    if (path.length > 0) return path.join(" › "); // readable, stable key
    // Return null to skip "(no suite)" as a counted suite (matches your prior behavior)
    return null;
  };

  results.forEach(({ matcherResults }) => {
    (matcherResults || []).forEach((r) => {
      const suiteKey = suiteKeyFromResult(r);
      const testKey = r.testName
        ? `${suiteKey || "(no suite)"}::${r.testName}`
        : undefined;

      if (suiteKey) suiteSet.add(suiteKey);
      if (testKey) testSet.add(testKey);

      if (suiteKey) {
        if (!suiteStatus[suiteKey])
          suiteStatus[suiteKey] = { passed: 0, failed: 0 };
        if (r.status === "passed") suiteStatus[suiteKey].passed++;
        else if (r.status === "failed") suiteStatus[suiteKey].failed++;
      }

      if (testKey) {
        if (!testStatus[testKey])
          testStatus[testKey] = { passed: 0, failed: 0 };
        if (r.status === "passed") testStatus[testKey].passed++;
        else if (r.status === "failed") testStatus[testKey].failed++;
      }
    });
  });

  // Count passed/failed suites and tests
  let passedSuites = 0,
    failedSuites = 0;
  let passedTests = 0,
    failedTests = 0;

  for (const suiteKey of suiteSet) {
    const s = suiteStatus[suiteKey];
    if (s.failed === 0 && s.passed > 0) passedSuites++;
    else failedSuites++;
  }

  for (const testKey of testSet) {
    const t = testStatus[testKey];
    if (t.failed === 0 && t.passed > 0) passedTests++;
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
