import { Worker as NodeWorker } from "worker_threads";
import { BaseWorker } from "./baseWorker.js";
import { fileURLToPath } from "url";
import path from "path";

class ThreadWorker extends BaseWorker {
  #path;
  #thread;
  #messageListeners = new Set();

  constructor(workerModulePath, id) {
    super(id);
    this.#path = workerModulePath;
    this.#thread = this.#createThread();

    // Forward all messages to registered listeners
    this.#thread.on("message", (message) => {
      for (const handler of this.#messageListeners) {
        handler(message);
      }
    });
  }

  #createThread() {
    const bootstrapPath = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "./thread-bootstrap.js"
    );

    return new NodeWorker(bootstrapPath, {
      workerData: { workerId: this.id, modulePath: this.#path },
    });
  }

  onMessage(handler) {
    this.#messageListeners.add(handler);
  }

  offMessage(handler) {
    this.#messageListeners.delete(handler);
  }

  run(task) {
    return new Promise((resolve, reject) => {
      // Only handle the final result for this run
      const resultHandler = (message) => {
        if (
          message &&
          Object.prototype.hasOwnProperty.call(message, "result")
        ) {
          this.#thread.off("message", resultHandler);
          resolve(message.result);
        } else if (
          message &&
          Object.prototype.hasOwnProperty.call(message, "error")
        ) {
          this.#thread.off("message", resultHandler);
          reject(new Error(message.error));
        }
        // All other messages are handled by persistent listeners
      };
      this.#thread.on("message", resultHandler);

      this.#thread.once("error", (error) => {
        this.#thread.off("message", resultHandler);
        reject(error);
      });
      this.#thread.postMessage(task);
      this.#thread.once("exit", (code) => {
        this.#thread.off("message", resultHandler);
        if (code !== 0) {
          reject(new Error(`Thread exited with code ${code}`));
        }
      });
    });
  }

  async close() {
    if (this.#thread) {
      await this.#thread.terminate();
      this.#thread = null;
    }
  }
}

export { ThreadWorker };
