import { Worker } from "@heritage/zest-worker";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";

class TestRunner {
  async runTests(testFiles, watcher, config) {
    return config.serial
      ? await this.#runTestsInBand(testFiles, watcher, config)
      : await this.#runTestsInParallel(testFiles, watcher, config);
  }

  // Unified test promise creation
  #createTestPromise(file, worker, config) {
    const matcherResults = [];
    let failed = false;

    function messageHandler(msg) {
      if (msg.type === "test_success") {
        const [suiteName, testName] = msg.args;
        matcherResults.push({ suiteName, testName, status: "passed" });
      } else if (msg.type === "test_failure") {
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

    const promise = worker.runTest(config, file);
    promise.UNSTABLE_onCustomMessage(messageHandler);

    return promise
      .then((result) => ({
        file,
        ...result,
        matcherResults,
        success: !failed,
      }))
      .catch((error) => {
        console.error(`Error running test ${file}:`, error);
        return {
          file,
          success: false,
          error: error?.message || error,
          matcherResults,
        };
      });
  }

  async #runTestsInBand(testFiles, watcher, config) {
    const root = dirname(fileURLToPath(import.meta.url));
    const workerPath = pathToFileURL(join(root, "./worker.js")).href;
    const worker = new Worker(workerPath, {
      useThreads: config.useWorkerThreads,
    });
    await worker.initialize();

    const allResults = [];
    for (const file of testFiles) {
      const result = await this.#createTestPromise(file, worker, config);
      allResults.push(result);
    }
    await worker.terminate();
    return allResults;
  }

  async #runTestsInParallel(testFiles, watcher, config) {
    const root = dirname(fileURLToPath(import.meta.url));
    const workerPath = pathToFileURL(join(root, "./worker.js")).href;
    const worker = new Worker(workerPath, {
      useThreads: config.useWorkerThreads,
    });
    await worker.initialize();

    const testPromises = testFiles.map((file) =>
      this.#createTestPromise(file, worker, config)
    );
    const results = await Promise.all(testPromises);

    await worker.terminate();
    return results;
  }
}

export { TestRunner };
