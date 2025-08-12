import { add, subtract } from "./example.js";

suite("toBe", () => {
  test("should pass", () => {
    expect(add(1, 2)).toBe(3);
  });

  test("should fail", () => {
    expect(subtract(5, 2)).toBe(4);
  });
});

suite("toEqual", () => {
  test("should pass", () => {
    expect({ name: "apple", color: "red" }).toEqual({
      name: "apple",
      color: "red",
    });
  });

  test("should fail", () => {
    expect({ name: "banana", color: "yellow" }).toEqual({
      name: "apple",
      color: "red",
    });
  });
});

suite("toBeTruthy", () => {
  test("should pass", () => {
    expect(true).toBeTruthy();
  });

  test("should fail", () => {
    expect(false).toBeTruthy();
  });
});

suite("toThrow", () => {
  test("should pass", () => {
    expect(() => {
      throw new Error("expected error");
    }).toThrow("expected error");
  });

  test("should fail (no throw)", () => {
    expect(() => {}).toThrow("expected error");
  });

  test("should fail (different error)", () => {
    expect(() => {
      throw new Error("different error");
    }).toThrow("expected error");
  });
});

suite("notToThrow", () => {
  test("should pass", () => {
    expect(() => {}).notToThrow("no error expected");
  });

  test("should fail (threw)", () => {
    expect(() => {
      throw new Error("unexpected error");
    }).notToThrow("unexpected error");
  });

  test("should fail (different error)", () => {
    expect(() => {
      throw new Error("different error");
    }).notToThrow("expected error");
  });
});

suite("toHaveProperties", () => {
  test("should pass", () => {
    const fruit = { sweetness: "high", acidity: "medium", aroma: "citrus" };
    expect(fruit).toHaveProperties({ sweetness: "high", aroma: "citrus" });
  });

  test("should fail", () => {
    const fruit = { sweetness: "high", acidity: "medium", aroma: "citrus" };
    expect(fruit).toHaveProperties({ aroma: "berry" });
  });
});

suite("multiple expectations", () => {
  test("should pass all", () => {
    expect(add(1, 2)).toBe(3);
    expect(subtract(5, 2)).toEqual(3);
  });

  test("should stop after first failure", () => {
    expect(add(1, 1)).toBe(3);
    expect(add(2, 2)).toEqual(4);
    expect(subtract(5, 5)).toEqual(3);
  });
});
