import FifoQueue from "./fifoQueue.js";

class Farm {
  constructor(workerPool) {
    this._taskQueue = new FifoQueue();
    this._workerPool = workerPool;
    this._isProcessing = false;
  }

  doWork(method, ...args) {
    const customMessageListeners = new Set();

    const addCustomMessageListener = (listener) => {
      customMessageListeners.add(listener);
      return () => customMessageListeners.delete(listener);
    };

    const onCustomMessage = (message) => {
      for (const listener of customMessageListeners) {
        listener(message);
      }
    };

    const promise = new Promise((resolve, reject) => {
      const request = [0, false, method, args];

      const task = {
        request,
        onStart: () => {},
        onEnd: (err, result) => {
          customMessageListeners.clear();
          if (err) reject(err);
          else resolve(result);
        },
        onCustomMessage,
      };

      this._taskQueue.enqueue(task);
      this._processQueue();
    });

    // Jest-compatible
    promise.UNSTABLE_onCustomMessage = addCustomMessageListener;

    return promise;
  }

  async _processQueue() {
    if (this._isProcessing) return;
    this._isProcessing = true;

    // Launch everything currently queued without awaiting
    while (!this._taskQueue.isEmpty()) {
      const task = this._taskQueue.dequeue();
      task.request[1] = true;
      task.onStart();

      this._workerPool
        .run({
          method: task.request[2],
          args: task.request[3],
          onCustomMessage: task.onCustomMessage,
        })
        .then((result) => task.onEnd(null, result))
        .catch((err) => task.onEnd(err))
        .finally(() => {
          // When any task completes, try to dispatch more (in case new items arrived)
          this._processQueue();
        });
    }

    this._isProcessing = false;
  }
}

export default Farm;
