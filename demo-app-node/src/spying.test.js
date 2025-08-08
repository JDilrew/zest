import * as example from "./example.js";

suite("with spy", () => {
  let addSpy;

  beforeEach(() => {
    addSpy = zest.spyOn(example, "add");
  });

  test("should pass when spied", () => {
    example.add(2, 3);

    expect(addSpy).toHaveBeenCalledWith(2, 3);
    expect(addSpy.calls.length).toBe(1);
  });
});
