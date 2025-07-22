import { Worker } from "@heritage/zest-worker";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";

class TestRunner {
  //    #eventEmitter = new Emittery<TestEvents>();

  async runTests(testFiles, watcher, config) {
    return config.serial
      ? this.#runTestsInBand(testFiles, watcher, config)
      : this.#runTestsInParallel(testFiles, watcher, config);
  }

  async #runTestsInBand(testFiles, watcher, config) {}

  async #runTestsInParallel(testFiles, watcher, config) {
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
}

export { TestRunner };
