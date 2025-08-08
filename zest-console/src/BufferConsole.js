class BufferConsole {
  _buffer = [];

  write(type, message) {
    // TODO: handle the stack

    this._buffer.push({
      message,
      // origin,
      type,
    });

    return this._buffer;
  }

  _log(type, message) {
    this.write(type, message);
  }

  debug(message) {
    this._log("debug", message);
  }

  log(message) {
    this._log("log", message);
  }

  warn(message) {
    this._log("warn", message);
  }

  error(message) {
    this._log("error", message);
  }

  getBuffer() {
    return this._buffer.length > 0 ? this._buffer : undefined;
  }
}

export { BufferConsole };
