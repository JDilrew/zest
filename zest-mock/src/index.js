// Minimal mocker: tracks calls & results as well as allowing you to swap impls.

export class ZestMocker {
  constructor(envGlobal = globalThis) {
    this._env = envGlobal;
    this._state = new WeakMap();
    this._config = new WeakMap();
    this._all = new Set(); // All created mocks (for bulk clear/reset)
    this._spies = new Set(); // Restore fns for spies
  }

  // Create a new mock function, optionally with an initial implementation.
  fn(implementation) {
    const mocker = this;

    function f(...args) {
      const s = mocker._ensureState(f);
      const c = mocker._ensureConfig(f);

      s.calls.push(args);
      s.lastCall = args;

      try {
        const impl = c.impl;
        const value = impl ? impl.apply(this, args) : undefined;
        s.results.push({ type: "return", value });
        return value;
      } catch (err) {
        s.results.push({ type: "throw", value: err });
        throw err;
      }
    }

    Object.defineProperty(f, "_isMockFunction", { value: true });
    this._state.set(f, { calls: [], results: [], lastCall: undefined });
    this._config.set(f, { impl: undefined });
    this._all.add(f);

    Object.defineProperty(f, "mock", {
      enumerable: true,
      get: () => this._ensureState(f),
    });

    Object.defineProperties(f, {
      calls: { enumerable: true, get: () => this._ensureState(f).calls },
      results: { enumerable: true, get: () => this._ensureState(f).results },
      lastCall: { enumerable: true, get: () => this._ensureState(f).lastCall },
    });

    f.mockImplementation = (fn) => {
      this._ensureConfig(f).impl = fn;
      return f;
    };

    f.mockImplementationOnce = (fn) => {
      this._ensureConfig(f).queue.push(fn);
      return f;
    };

    f.mockReturnValue = (value) => f.mockImplementation(() => value);

    f.mockReturn = (valOrFn) =>
      typeof valOrFn === "function"
        ? f.mockImplementation(valOrFn)
        : f.mockReturnValue(valOrFn);

    f.getMockImplementation = () => this._ensureConfig(f).impl;

    f.mockClear = () => {
      this._state.set(f, { calls: [], results: [], lastCall: undefined });
      return f;
    };

    f.mockReset = () => {
      f.mockClear();
      this._config.set(f, { impl: undefined, queue: [] });
      return f;
    };

    if (typeof implementation === "function")
      f.mockImplementation(implementation);

    return f;
  }

  spyOn(obj, key) {
    if (!obj || (typeof obj !== "object" && typeof obj !== "function")) {
      throw new TypeError("spyOn target must be an object");
    }

    const original = obj[key];
    if (typeof original !== "function") {
      throw new TypeError(`Property "${String(key)}" is not a function`);
    }

    const mock = this.fn(function (...args) {
      return original.apply(this, args);
    });

    const restore = () => {
      obj[key] = original;
    };

    mock.mockRestore = () => {
      mock.mockReset();
      restore();
      this._spies.delete(restore);
    };
    this._spies.add(restore);

    obj[key] = mock;
    return mock;
  }

  clearAllMocks() {
    for (const m of this._all) m.mockClear();
  }

  resetAllMocks() {
    for (const m of this._all) m.mockReset();
  }

  restoreAllMocks() {
    for (const r of [...this._spies]) r();
    this._spies.clear();
  }

  isMockFunction(fn) {
    return !!(fn && fn._isMockFunction === true);
  }

  // internals
  _ensureState(f) {
    return (
      this._state.get(f) ||
      (this._state.set(f, { calls: [], results: [], lastCall: undefined }),
      this._state.get(f))
    );
  }

  _ensureConfig(f) {
    return (
      this._config.get(f) ||
      (this._config.set(f, { impl: undefined }), this._config.get(f))
    );
  }
}

const ZestMock = new ZestMocker(globalThis);

export const fn = ZestMock.fn.bind(ZestMock);
export const spyOn = ZestMock.spyOn.bind(ZestMock);
export const isMockFunction = ZestMock.isMockFunction.bind(ZestMock);
export const clearAllMocks = ZestMock.clearAllMocks.bind(ZestMock);
export const resetAllMocks = ZestMock.resetAllMocks.bind(ZestMock);
export const restoreAllMocks = ZestMock.restoreAllMocks.bind(ZestMock);
