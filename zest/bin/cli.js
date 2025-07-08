#!/usr/bin/env node
import { findTestFiles } from "../src/finder.js";
import { run } from "../src/runner.js";
import { applyMocks } from "../src/mocking.js";
import chalk from "chalk";
import { pathToFileURL } from "url";

// Ensure zest globals (expect, describe, it) are available
import "../src/index.js";

// Apply mocks before loading test files
applyMocks();

// Parse CLI arguments
const args = process.argv.slice(2);
const command = args[0];
let pathArg = null;
let silent = false;

for (let i = 1; i < args.length; i++) {
  if (args[i] === "--silent") {
    silent = true;
  } else if (!pathArg) {
    pathArg = args[i];
  }
}

let testFiles;
if (pathArg) {
  // If a path is provided, only run tests in that file or directory
  const fs = require("fs");
  const path = require("path");
  const absPath = path.resolve(process.cwd(), pathArg);
  if (fs.existsSync(absPath) && fs.statSync(absPath).isDirectory()) {
    testFiles = findTestFiles("**/*.test.js", absPath);
  } else if (fs.existsSync(absPath)) {
    testFiles = [absPath];
  } else {
    if (!silent) console.error(chalk.bold.red("Path does not exist:"), pathArg);
    process.exit(1);
  }
} else {
  testFiles = findTestFiles();
}
import path from "path";

(async () => {
  for (const file of testFiles) {
    global.__zestCurrentTestFile = path.relative(process.cwd(), file);
    await import(pathToFileURL(file)); // This registers suites/tests globally
  }
  delete global.__zestCurrentTestFile;

  if (command === "test" || !command) {
    run({ silent });
  } else {
    if (!silent) console.error(chalk.bold.red("Unknown command:"), command);
  }
})();
