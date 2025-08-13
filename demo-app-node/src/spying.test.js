import * as example from "./example.js";

let addSpy;

beforeEach(() => {
  addSpy = zest.spyOn(example, "add");
});

test("spies on calls made to the function", () => {
  example.add(2, 3);

  expect(addSpy).toHaveBeenCalledWith(2, 3);
  expect(addSpy.calls.length).toBe(1);
});
