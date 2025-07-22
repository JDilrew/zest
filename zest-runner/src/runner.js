import { Worker } from "@heritage/zest-worker";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";

// EXCERPT-FROM-JEST; Keeping the core of "runTest" as a separate function (as "runTestInternal")
// is key to be able to detect memory leaks. Since all variables are local to
// the function, when "runTestInternal" finishes its execution, they can all be
// freed, UNLESS something else is leaking them (and that's why we can detect
// the leak!).
function runTestInternal() {}

async function run(config, testFiles, silent = false) {
  const root = dirname(fileURLToPath(import.meta.url));
  const workerPath = pathToFileURL(join(root, "./worker.js")).href;
  const worker = new Worker(workerPath, {
    useThreads: config.useWorkerThreads,
  });
  await worker.initialize();

  // Collect all matcher results for summary
  const allResults = [];
  await Promise.all(
    Array.from(testFiles).map(async (file) => {
      // ship this off to a parallel worker
      const result = await worker.runTest(config, file);
      allResults.push({ file, ...result });
    })
  );

  // Return all results for reporters/cli
  return allResults;
}

export { run };
