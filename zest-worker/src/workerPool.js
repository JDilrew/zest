import { ChildProcessWorker } from "./childProcessWorker.js";
import { ThreadWorker } from "./threadWorker.js";

class WorkerPool {
  _path;
  _workers = [];
  _busyWorkers = new Set();
  _maxWorkers = 3;

  constructor(path, options = {}) {
    this._path = path;
    if (typeof options.maxWorkers === "number") {
      this._maxWorkers = options.maxWorkers;
    }
  }

  spawnWorker() {
    throw new Error("Method not implemented.");
  }

  getWorkerById(workerId) {
    return this._workers[workerId];
  }

  async run(task) {
    // Find an idle worker
    let worker = this._workers.find((w) => !this._busyWorkers.has(w));

    // If no idle worker and pool not full, spawn a new one
    if (!worker && this._workers.length < this._maxWorkers) {
      worker = this.spawnWorker();
    }

    // If still no worker, wait for one to become available
    if (!worker) {
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          worker = this._workers.find((w) => !this._busyWorkers.has(w));
          if (worker) {
            clearInterval(interval);
            resolve();
          }
        }, 10);
      });
    }

    this._busyWorkers.add(worker);
    try {
      return await worker.run(task);
    } finally {
      this._busyWorkers.delete(worker);
    }
  }

  async terminate() {
    await Promise.all(this._workers.map((worker) => worker.close()));
    this._workers = [];
    this._busyWorkers.clear();
  }
}

class ChildProcessPool extends WorkerPool {
  spawnWorker() {
    const worker = new ChildProcessWorker(this._path, this._workers.length);
    this._workers.push(worker);
    return worker;
  }
}

class ThreadPool extends WorkerPool {
  spawnWorker() {
    const worker = new ThreadWorker(this._path, this._workers.length);
    this._workers.push(worker);
    return worker;
  }
}

export { WorkerPool, ChildProcessPool, ThreadPool };
