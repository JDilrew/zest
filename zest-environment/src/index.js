import vm from "vm";

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

class JsdomEnvironment extends BaseEnvironment {
  async setup() {
    if (!JSDOM) throw new Error("jsdom is not installed");
    this.dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
      url: "http://localhost/",
    });
    this.global = this.dom.window;
    this.context = vm.createContext(this.global);
  }

  async teardown() {
    if (this.dom) this.dom.window.close();
    this.context = null;
  }
}

class NodeEnvironment extends BaseEnvironment {
  async setup() {
    this.global = Object.create(global);
    this.context = vm.createContext(this.global);
  }
  async teardown() {
    this.context = null;
  }
}

export { BaseEnvironment, JsdomEnvironment, NodeEnvironment };
