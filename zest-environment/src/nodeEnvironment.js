import { BaseEnvironment } from ".";
import vm from "vm";

class NodeEnvironment extends BaseEnvironment {
  async setup() {
    this.global = Object.create(global);
    this.context = vm.createContext(this.global);
  }
  async teardown() {
    this.context = null;
  }
}

export { NodeEnvironment };
