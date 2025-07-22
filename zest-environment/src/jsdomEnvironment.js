import { BaseEnvironment } from ".";
import vm from "vm";

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

export { JsdomEnvironment };
