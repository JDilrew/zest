import { ChildProcessPool, ThreadPool } from "./workerPool.js";

async function getExposedFunctions(path, options) {
  let exposedMethods = options.exposedMethods;

  if (!exposedMethods) {
    const module = await import(path);

    // If the module itself is a function (CommonJS default export)
    if (typeof module.default === "function") {
      exposedMethods = ["default"];
    } else {
      exposedMethods = Object.keys(module).filter(
        (name) => typeof module[name] === "function"
      );
      // Also check if default is an object with functions
      if (typeof module.default === "object" && module.default !== null) {
        exposedMethods = [
          ...exposedMethods,
          ...Object.keys(module.default).filter(
            (name) => typeof module.default[name] === "function"
          ),
        ];
      }
    }
  }

  return exposedMethods;
}

class Worker {
  #path;
  #options;
  #workerPool;

  /**
   *
   * @param {string} path
   * @param {Options} options
   */
  constructor(path, options) {
    this.#path = path;
    this.#options = options || {
      useThreads: false,
      maxWorkers: 1,
    };

    // TODO: MAYBE: only import the one used???
    if (this.#options.useThreads) {
      this.#workerPool = new ThreadPool(this.#path, this.#options);
    } else {
      this.#workerPool = new ChildProcessPool(this.#path, this.#options);
    }
  }

  async initialize() {
    await this.#bindExposedFunctions(this.#path, this.#options);
  }

  async #bindExposedFunctions(path, options) {
    const exposedFunctions = await getExposedFunctions(path, options);

    for (const name of exposedFunctions) {
      this[name] = this.#callBoundFunction.bind(this, name);
    }
  }

  #callBoundFunction(method, args) {
    return this.#workerPool.run({ method, args });
    // return this._farm.doWork(method, ...args);
  }

  // run(task) {
  //   console.log("Running task in worker pool...", task);

  //   if (!this.#workerPool) {
  //     throw new Error("Worker pool not initialized.");
  //   }

  //   // if (typeof task !== "function") {
  //   //   throw new TypeError("Task must be a function.");
  //   // }

  //   return this.#workerPool.run(task);
  // }
}

export { Worker };
