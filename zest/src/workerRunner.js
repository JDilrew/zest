import chalk from "chalk";
import { Worker } from "@heritage/zest-worker";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { relative } from "path";

async function run(testFiles, silent = false) {
  const root = dirname(fileURLToPath(import.meta.url));

  const workerPath = pathToFileURL(join(root, "./worker.js")).href;
  const worker = new Worker(workerPath, { useThreads: false });
  await worker.initialize();

  console.log(chalk.bold.yellow("---\n"));
  console.log(chalk.bold.yellow("🍋 Running tests...\n"));
  console.log(chalk.bold.yellow("---\n"));

  await Promise.all(
    Array.from(testFiles).map(async (file) => {
      // ship this off to a parallel worker
      const { success, errorMessage, matcherResults } = await worker.runTest(
        file
      );

      const status = success
        ? chalk.green.inverse.bold(" PASS ")
        : chalk.red.inverse.bold(" FAIL ");

      console.log(status + " " + chalk.dim(relative(root, file)));
      if (!success) {
        console.log("  " + errorMessage);
      }

      // Print matcher results
      if (matcherResults && matcherResults.length > 0) {
        matcherResults.forEach((result, idx) => {
          const icon =
            result.status === "passed" ? chalk.green("✓") : chalk.red("✗");
          let msg = `    ${icon} ${result.matcher}`;
          if (result.status === "failed" && result.error) {
            msg += `: ${chalk.red(result.error)}`;
          }
          console.log(msg);
        });
      }
    })
  );
}

export { run };
