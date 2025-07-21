#!/usr/bin/env node
import "@heritage/zest-cli/bin/cli";

// import { run } from "@heritage/zest-runner/runner";
// import { resolveTestFiles } from "@heritage/zest-finder";
// import { applyMocks } from "@heritage/zest-mock";
// import { parseArgs } from "@heritage/zest-cli/args";

// // Apply mocks before loading test files
// applyMocks();

// // Parse CLI arguments
// const { command, pathArg, silent } = parseArgs(process.argv.slice(2));

// const testFiles = await resolveTestFiles(pathArg, silent);

// if (command === "test") {
//   run(testFiles, silent);
// } else {
//   console.error(chalk.bold.red("Unknown command:"), command);
// }
