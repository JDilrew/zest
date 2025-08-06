import { ChildProcess, fork } from "child_process";
import { BaseWorker } from "./baseWorker.js";
import { fileURLToPath } from "url";
import path from "path";

class ChildProcessWorker extends BaseWorker {
  #path;
  #childProcess;

  constructor(workerModulePath, id) {
    super(id);
    this.#path = workerModulePath;
    this.#childProcess = this.#createChildProcess();
  }

  #createChildProcess() {
    // Path to the bootstrapper
    const bootstrapPath = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "./child-bootstrap.js"
    );
    // Pass the actual worker module path as an argument
    const modulePath = this.#path.startsWith("file:")
      ? this.#path
      : pathToFileURL(this.#path).href;
    // const options = {
    //   execArgv: ["--no-warnings"],
    // };
    // console.warn(
    //   `Creating child process for worker at: ${bootstrapPath} with module: ${modulePath}`
    // );

    const forkOptions = {
      cwd: process.cwd(),
      // env: {
      // ...process.env,
      // ZEST_WORKER_ID: String(this._options.workerId + 1), // 0-indexed workerId, 1-indexed JEST_WORKER_ID
      // ...forceColor,
      // },
      // Suppress --debug / --inspect flags while preserving others (like --harmony).
      // execArgv: process.execArgv.filter((v) => !/^--(debug|inspect)/.test(v)),
      // default to advanced serialization in order to match worker threads
      serialization: "advanced",
      // silent: options.silent,
      // ...this._options.forkOptions,
      env: {
        ...process.env,
        WORKER_ID: String(this.id), // 👈 inject worker ID here
      },
    };

    return fork(bootstrapPath, [modulePath], forkOptions);
  }

  run(task) {
    return new Promise((resolve, reject) => {
      const results = [];
      this.#childProcess.on("message", (message) => {
        if (message.error) {
          reject(new Error(message.error));
        } else if (message.type === "test_end") {
          resolve(results);
        } else if (
          message.type === "test_success" ||
          message.type === "test_failure"
        ) {
          results.push(message); // optional — you're already getting final result in done
        }
      });

      this.#childProcess.once("error", (error) => {
        // console.error("Child process error:", error);
        reject(error);
      });

      this.#childProcess.send(task, () => {
        // console.log("Task sent to child process:", task);
      });

      this.#childProcess.once("exit", (code) => {
        if (code !== 0) {
          // console.error(`Child process exited with code ${code}`);
          reject(new Error(`Child process exited with code ${code}`));
        }
        // else {
        //   console.log("Child process exited successfully.");
        // }
      });
    });
  }

  close() {
    if (this.#childProcess) {
      this.#childProcess.kill();
      this.#childProcess = null;
    }
  }
}

export { ChildProcessWorker };
