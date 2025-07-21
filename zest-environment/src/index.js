class BaseEnvironment {
  constructor() {
    this.global = {};
    this.context = null;
  }
  async setup() {
    // Setup logic (override in subclasses)
  }
  async teardown() {
    // Teardown logic (override in subclasses)
    this.context = null;
  }
}

export default { BaseEnvironment };
