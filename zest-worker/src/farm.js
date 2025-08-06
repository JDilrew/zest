// this basically just handles a queue of tasks and in what order you want to pop that stack
// it ships the work to the worker-pool using worker ids and handles locking on that id
// attaches additional listeners
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import FifoQueue from "./fifoQueue.js";

class Farm {
  constructor(workerPool) {
    this._taskQueue = new FifoQueue();
    this._workerPool = workerPool;
    this._isProcessing = false;
  }

  async doWork(method, args) {
    return new Promise((resolve, reject) => {
      const request = [0, false, method, args];
      const task = {
        request,
        onStart: () => {},
        onEnd: (err, result) => (err ? reject(err) : resolve(result)),
        onCustomMessage: () => {},
      };

      this._taskQueue.enqueue(task);
      this._processQueue();
    });
  }

  async _processQueue() {
    if (this._isProcessing) return;
    this._isProcessing = true;

    while (!this._taskQueue.isEmpty()) {
      const task = this._taskQueue.dequeue();

      try {
        // Let the worker pool decide how and when to run the task
        task.request[1] = true;
        task.onStart();
        const result = await this._workerPool.run({
          method: task.request[2],
          args: task.request[3],
        });
        task.onEnd(null, result);
      } catch (err) {
        task.onEnd(err);
      }
    }

    this._isProcessing = false;
  }
}

export default Farm;
