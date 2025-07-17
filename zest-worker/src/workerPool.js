import { ChildProcessWorker } from "./childProcessWorker.js";
import { ThreadWorker } from "./threadWorker.js";

class WorkerPool {
  _path;
  _workers = [];

  constructor(path) {
    this._path = path;
  }

  spawnWorker() {
    throw new Error("Method not implemented.");
  }

  // terminateWorker(workerId) {
  //   this._workers = this._workers.filter((worker) => worker.id !== workerId);
  // }

  run(task) {
    if (this._workers.length === 0) {
      this.spawnWorker();
    }

    const worker = this._workers.shift();

    return worker.run(task).finally(() => {
      if (typeof worker.close === "function") {
        worker.close();
      }
      // Do NOT push the worker back into the pool
    });
  }
}

class ChildProcessPool extends WorkerPool {
  spawnWorker() {
    this._workers.push(new ChildProcessWorker(this._path));
  }
}

class ThreadPool extends WorkerPool {
  spawnWorker() {
    this._workers.push(new ThreadWorker(this._path));
  }
}

export { WorkerPool, ChildProcessPool, ThreadPool };
