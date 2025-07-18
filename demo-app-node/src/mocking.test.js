zest.mock("./example.js", {
  add: (a, b) => a + b + 5,
  subtract: (a, b) => a - b - 5,
});

import { add, subtract } from "./example.js";

test("should pass when mocked", () => {
  const addResult = add(2, 3);
  expect(addResult).toBe(10); // 2 + 3 + 5 from mock
  const subtractResult = subtract(10, 3);
  expect(subtractResult).toBe(2); // 10 - 3 -
});
