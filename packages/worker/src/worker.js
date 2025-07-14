class Worker {
  #path;
  #options;
  #worker;

  constructor(path, options) {
    this.#path = path;
    this.#options = options || {
      maxWorkers: 1,
      useThreads: false,
    };

    if (this.#options.useThreads) {
      this.#worker = new WorkerThread(this.#path, this.#options);
    } else {
      this.#worker = new ThreadWorker(this.#path, this.#options);
    }
  }
}
