class TestRunner {
  //    #eventEmitter = new Emittery<TestEvents>();

  async runTests(tests, watcher, options) {
    return options.serial
      ? this.runTestsInBand(tests, watcher)
      : this.#runTestsInParallel(tests, watcher);
  }

  async runTestsInBand(tests, watcher) {}

  async #runTestsInParallel(tests, watcher) {}
}
