import { BaseWorker } from "./baseWorker.js";

class ThreadWorker extends BaseWorker {
  #path;
  #thread;

  constructor(path) {
    this.#path = path;

    this.#thread = this.#createThread();
  }

  #createThread() {
    throw new Error("Method not implemented.");
  }

  run() {
    throw new Error("Method not implemented.");
  }
}

export { ThreadWorker };
