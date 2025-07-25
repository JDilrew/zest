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

//TODO: Jest doesn't even do anything in the setup calls, its in the constructors, which do I prefer?
class JsdomEnvironment extends BaseEnvironment {
  async setup() {
    if (!JSDOM) throw new Error("jsdom is not installed");
    this.dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
      url: "http://localhost/",
      pretendToBeVisual: true,
      runScripts: "dangerously",
    });
    this.global = this.dom.window;
    this.context = vm.createContext(this.global);
  }

  async teardown() {
    if (this.dom) this.dom.window.close();
    this.context = null;
  }

  getVmContext() {
    if (this.dom) {
      return this.dom.getInternalVMContext();
    }
    return null;
  }
}

//TODO: Jest uses a globalProxy for the nodeEnvironment, so the teardown can call delete on
// the props. This can be used to detect leaks, maybe I will bother later.
class NodeEnvironment extends BaseEnvironment {
  async setup() {
    this.global = Object.create(global);
    this.context = vm.createContext(this.global);
  }

  async teardown() {
    this.context = null;
  }

  getVmContext() {
    return this.context;
  }
}

export { BaseEnvironment, JsdomEnvironment, NodeEnvironment };
