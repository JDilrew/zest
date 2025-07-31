#!/usr/bin/env node
import { parseArgs } from "../src/args.js";
import { resolveTestFiles } from "@heritage/zest-finder";
import { TestRunner } from "@heritage/zest-runner";
import { reportStart, reportResults } from "@heritage/zest-reporters";
import { loadConfig } from "@heritage/zest-config";

// Parse CLI arguments
const { command, pathArg, silent } = parseArgs(process.argv.slice(2));

// Prefer config from ZEST_CONFIG env, else look for zest.config.js in cwd
let configInput = process.env.ZEST_CONFIG;
if (!configInput) {
  // Look for zest.config.js in the current working directory
  configInput = "zest.config.js";
}
const config = await loadConfig(configInput);

const testFiles = await resolveTestFiles(pathArg, silent);

if (command === "test") {
  reportStart();

  const runner = new TestRunner();
  const results = await runner.runTests(testFiles, undefined, config);

  reportResults(results);
} else {
  console.error(chalk.bold.red("Unknown command:"), command);
}
