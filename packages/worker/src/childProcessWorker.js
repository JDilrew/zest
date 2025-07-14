import { ChildProcess, ForkOptions, fork } from "child_process";

class ChildProcessWorker {
  #path;
  #options;
  #childProcess;

  constructor(path, options) {
    this.#path = path;
    this.#options = options || {
      maxWorkers: 1,
      useThreads: false,
    };

    this.#childProcess = this.#createChildProcess();
  }

  #createChildProcess() {}

  run() {}
}

export default ChildProcessWorker;
