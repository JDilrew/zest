import { add, subtract } from "./example.js";

test("should pass when un-mocked", () => {
  const addResult = add(2, 3);
  expect(addResult).toBe(5); // 2 + 3
  const subtractResult = subtract(10, 3);
  expect(subtractResult).toBe(7); // 10 - 3
});

suite("with mock", () => {
  let addSpy;

  beforeEach(() => {
    // TODO: fix spying
    // addSpy = zest.spyOn("./example.js", "add");
    console.log("Before each test called!");
  });

  test("should pass when mocked", () => {
    const addResult = add(2, 3);
    expect(addResult).toBe(10); // 2 + 3 + 5 from mock

    expect(addSpy).toHaveBeenCalledWith(2, 3);
  });
});
