import { Worker as NodeWorker } from "worker_threads";
import { BaseWorker } from "./baseWorker.js";
import { fileURLToPath } from "url";
import path from "path";

class ThreadWorker extends BaseWorker {
  #path;
  #thread;

  constructor(workerModulePath) {
    super();
    this.#path = workerModulePath;
    this.#thread = this.#createThread();
  }

  #createThread() {
    const bootstrapPath = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "./thread-bootstrap.js"
    );

    return new NodeWorker(bootstrapPath, {
      workerData: { modulePath: this.#path },
    });
  }

  run(task) {
    return new Promise((resolve, reject) => {
      this.#thread.once("message", (message) => {
        if (message.error) {
          reject(new Error(message.error));
        } else {
          resolve(message.result);
        }
      });
      this.#thread.once("error", (error) => {
        reject(error);
      });
      this.#thread.postMessage(task);
      this.#thread.once("exit", (code) => {
        if (code !== 0) {
          reject(new Error(`Thread exited with code ${code}`));
        }
      });
    });
  }

  close() {
    if (this.#thread) {
      this.#thread.terminate();
      this.#thread = null;
    }
  }
}

export { ThreadWorker };
