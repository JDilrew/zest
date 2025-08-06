class FifoQueue {
  constructor() {
    this._items = [];
  }

  enqueue(item) {
    this._items.push(item);
  }

  dequeue() {
    return this._items.shift() || null;
  }

  isEmpty() {
    return this._items.length === 0;
  }
}

export default FifoQueue;
