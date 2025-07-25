class BaseWorker {
  id = Math.random().toString(36).substring(2, 15);

  run(task) {
    throw new Error("run method not implemented");
  }

  close() {
    throw new Error("close method not implemented");
  }
}

export { BaseWorker };
