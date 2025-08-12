import vm from "vm";
import { JSDOM } from "jsdom";

class BaseEnvironment {
  constructor() {
    this.global = {};
  }
  async setup() {
    // Setup logic (override in subclasses)
  }
  async teardown() {
    // Teardown logic (override in subclasses)
  }
}

// Jest performs the setup in the constructor, but I need it async.
class JsdomEnvironment extends BaseEnvironment {
  async setup() {
    if (!JSDOM) throw new Error("jsdom is not installed");
    this.dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
      url: "http://localhost/",
      pretendToBeVisual: true,
      runScripts: "dangerously",
    });
    this.global = this.dom.window;

    const win = this.dom.window;
    this.global = win;

    win.window = win;
    win.self = win;
    win.global = win;
    win.globalThis = win;
  }

  async teardown() {
    if (this.dom) this.dom.window.close();
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
