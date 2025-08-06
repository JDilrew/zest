class BaseWorker {
  id;

  constructor(id) {
    this.id = id;
  }

  run(task) {
    throw new Error("run method not implemented");
  }

  close() {
    throw new Error("close method not implemented");
  }
}

export { BaseWorker };
