import { Worker } from "@heritage/zest-worker";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";

class TestRunner {
  async runTests(testFiles, watcher, config) {
    return config.serial
      ? await this.#runTestsInBand(testFiles, watcher, config)
      : await this.#runTestsInParallel(testFiles, watcher, config);
  }

  async #runTestsInBand(testFiles, watcher, config) {
    throw new Error("Running tests in band is not yet implemented.");
  }

  async #runTestsInParallel(testFiles, watcher, config) {
    const root = dirname(fileURLToPath(import.meta.url));
    const workerPath = pathToFileURL(join(root, "./worker.js")).href;
    const worker = new Worker(workerPath, {
      useThreads: config.useWorkerThreads,
    });
    await worker.initialize();

    // Collect all matcher results for summary, and aggregate events in real time
    const allResults = [];

    // Optionally, you could emit events here for real-time reporting
    for (const file of testFiles) {
      // Listen for events from the worker for this test file
      const matcherResults = [];

      let failed = false;

      // Handler to collect test events
      function messageHandler(msg) {
        if (msg.event === "test_success") {
          const [suiteName, testName] = msg.args;
          matcherResults.push({ suiteName, testName, status: "passed" });
        } else if (msg.event === "test_failure") {
          const [suiteName, testName, error] = msg.args;
          matcherResults.push({
            suiteName,
            testName,
            status: "failed",
            error: error?.message || error,
          });
          failed = true;
        }
      }

      // worker.on("message", messageHandler);

      // Run the test file
      const result = await worker.runTest(config, file);

      // Remove the message handler after the test run
      // worker.off("message", messageHandler);

      // Merge matcherResults into the result (in case the worker.runTest result doesn't include them)
      allResults.push({
        file,
        ...result,
        matcherResults,
        success: !failed,
      });

      // console.log(allResults);
    }

    await worker.terminate();

    // Return all results for reporters/cli
    return allResults;
  }
}

export { TestRunner };
