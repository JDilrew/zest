#!/usr/bin/env node
import { runCLI } from "../src/run.js";

runCLI(process.argv.slice(2)).then((passed) => {
  process.exitCode = passed ? 0 : 1;
});
