import { Worker } from "@jdilrew/zest-worker";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";

class TestRunner {
  async runTests(testFiles, config, watcher) {
    return config.serial
      ? await this.#runTestsInBand(testFiles, config, watcher)
      : await this.#runTestsInParallel(testFiles, config, watcher);
  }

  // Unified test promise creation
  #createTestPromise(file, worker, config) {
    const matcherResults = [];
    let failed = false;

    function messageHandler(message) {
      if (message.type === "test_success") {
        const [suiteName, testName] = message.args;
        matcherResults.push({ suiteName, testName, status: "passed" });
      } else if (message.type === "test_failure") {
        const [suiteName, testName, error] = message.args;
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
      .then((result) => {
        return {
          file,
          result,
          matcherResults,
          success: !failed,
        };
      })
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

  async #runTestsInBand(testFiles, config, watcher) {
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
      watcher(result);
    }

    await worker.terminate();

    return allResults;
  }

  async #runTestsInParallel(testFiles, config, watcher) {
    const root = dirname(fileURLToPath(import.meta.url));

    const workerPath = pathToFileURL(join(root, "./worker.js")).href;
    const worker = new Worker(workerPath, {
      useThreads: config.useWorkerThreads,
    });
    await worker.initialize();

    const results = [];

    await Promise.all(
      testFiles.map(async (file) => {
        const result = await this.#createTestPromise(file, worker, config);
        results.push(result);
        watcher(result);
      })
    );
    await worker.terminate();

    return results;
  }
}

export { TestRunner };
