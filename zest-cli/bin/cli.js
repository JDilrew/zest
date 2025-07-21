#!/usr/bin/env node
import { resolveTestFiles } from "../src/finder.js";
import { run } from "../src/workerRunner.js";
import { parseArgs } from "./args.js";

// Parse CLI arguments
const { command, pathArg, silent } = parseArgs(process.argv.slice(2));

const testFiles = await resolveTestFiles(pathArg, silent);

run(testFiles, silent);

// (async () => {
//   for (const file of testFiles) {
//     global.__zestCurrentTestFile = path.relative(process.cwd(), file);
//     await import(pathToFileURL(file)); // This registers suites/tests globally
//   }
//   delete global.__zestCurrentTestFile;

//   if (command === "test") {
//     run({ silent });
//   } else {
//     console.error(chalk.bold.red("Unknown command:"), command);
//   }
// })();
