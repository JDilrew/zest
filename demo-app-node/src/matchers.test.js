import { add, subtract } from "./example.js";

suite("toBe", () => {
  test("should pass when the value matches", () => {
    expect(add(1, 2)).toBe(3);
  });

  test("should fail when the value is different", () => {
    expect(subtract(5, 2)).toBe(4);
  });
});

suite("toEqual", () => {
  test("should pass when the objects are equal", () => {
    expect({ name: "apple", color: "red" }).toEqual({
      name: "apple",
      color: "red",
    });
  });

  test("should fail when the objects are not equal", () => {
    expect({ name: "banana", color: "yellow" }).toEqual({
      name: "apple",
      color: "red",
    });
  });
});

suite("toBeTruthy", () => {
  test("should pass when the value is truthy", () => {
    expect(true).toBeTruthy();
  });

  test("should fail when the value is falsy", () => {
    expect(false).toBeTruthy();
  });
});

suite("toThrow", () => {
  test("should pass when an error was thrown", () => {
    expect(() => {
      throw new Error("expected error");
    }).toThrow("expected error");
  });

  test("should fail when an error was not throw", () => {
    expect(() => {}).toThrow("expected error");
  });

  test("should fail when a different error was thrown", () => {
    expect(() => {
      throw new Error("different error");
    }).toThrow("expected error");
  });
});

suite("notToThrow", () => {
  test("should pass when an error was not thrown", () => {
    expect(() => {}).notToThrow("no error expected");
  });

  test("should fail when an error was thrown", () => {
    expect(() => {
      throw new Error("unexpected error");
    }).notToThrow("unexpected error");
  });

  test("should fail even when a different error was thrown", () => {
    expect(() => {
      throw new Error("different error");
    }).notToThrow("expected error");
  });
});

suite("toHaveProperties", () => {
  test("should pass when the object contains the property with expected value", () => {
    const fruit = { sweetness: "high", acidity: "medium", aroma: "citrus" };
    expect(fruit).toHaveProperties({ sweetness: "high", aroma: "citrus" });
  });

  test("should fail when the object does not contain the property", () => {
    const fruit = { sweetness: "high", acidity: "medium", aroma: "citrus" };
    expect(fruit).toHaveProperties({ taste: "bitter" });
  });

  test("should fail when the object contains the property with different values", () => {
    const fruit = { sweetness: "high", acidity: "medium", aroma: "citrus" };
    expect(fruit).toHaveProperties({ aroma: "berry" });
  });
});

suite("multiple expectations", () => {
  test("should pass multiple assertions", () => {
    expect(add(1, 2)).toBe(3);
    expect(subtract(5, 2)).toEqual(3);
  });

  test("should fail and stop after first failure", () => {
    expect(add(1, 1)).toBe(3);

    console.error("This point should never be hit");

    expect(add(2, 2)).toEqual(4);
    expect(subtract(5, 5)).toEqual(3);
  });
});
