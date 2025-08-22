import { add, subtract } from "./example.js";

zest.mock("./example.js", {
  add: (a, b) => {
    return a + b + 5;
  },
  subtract: (a, b) => {
    return a - b - 5;
  },
});

test("mocking replaces original functionality", () => {
  const addResult = add(2, 3);
  expect(addResult).toBe(10); // 2 + 3 + 5 from mock

  const subtractResult = subtract(10, 3);
  expect(subtractResult).toBe(2); // 10 - 3 - 5 from mock
});

test("mock implementation can be updated", () => {
  add.mockImplementation((a, b) => a + b + 100);

  const addResult = add(10, 3);
  expect(addResult).toBe(113);
});

test("mock return value can be updated", () => {
  add.mockReturnValue(37);

  const addResult = add(10, 3);
  expect(addResult).toBe(37);
});
