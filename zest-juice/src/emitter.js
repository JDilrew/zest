// Simple event emitter for reporting (local to zest-juice)
class EventEmitter {
  constructor() {
    this.listeners = {};
  }
  on(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }
  emit(event, ...args) {
    if (this.listeners[event]) {
      for (const fn of this.listeners[event]) fn(...args);
    }
    // Forward to parent process if possible (Node worker/child or worker thread)
    if (typeof process !== "undefined" && typeof process.send === "function") {
      process.send({
        workerId: Number(process.env.WORKER_ID),
        type: event,
        args,
      });
    } else {
      // Try worker_threads parentPort
      try {
        // Dynamically require to avoid errors in non-thread environments
        const { parentPort } = require("worker_threads");
        if (parentPort && typeof parentPort.postMessage === "function") {
          parentPort.postMessage({
            workerId: global.__WORKER_ID__,
            type: event,
            args,
          });
        }
      } catch (e) {
        // Not in a worker thread, ignore
      }
    }
  }
  removeAllListeners() {
    this.listeners = {};
  }
}

export { EventEmitter };
