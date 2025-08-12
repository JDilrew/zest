zest.mock("./example.js", {
  add: (a, b) => {
    return a + b + 5;
  },
  subtract: (a, b) => {
    return a - b - 5;
  },
});

import { add, subtract } from "./example.js";

test("should pass when mocked", () => {
  const addResult = add(2, 3);
  expect(addResult).toBe(10); // 2 + 3 + 5 from mock

  const subtractResult = subtract(10, 3);
  expect(subtractResult).toBe(2); // 10 - 3 - 5 from mock
});

test("should pass when the mock implementation is updated", () => {
  add.mockImplementation((a, b) => a + b + 100);

  const addResult = add(10, 3);
  expect(addResult).toBe(113);
});

test("should pass when the mock return value is updated", () => {
  add.mockReturnValue(37);

  const addResult = add(10, 3);
  expect(addResult).toBe(37);
});
