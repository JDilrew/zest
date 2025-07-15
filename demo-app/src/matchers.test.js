import { add, subtract } from "./example.js";

suite("toBe", () => {
  test("should pass", () => {
    expect(add(1, 2)).toBe(3);
  });

  test("should fail", () => {
    expect(subtract(5, 2)).toBe(4); // This will fail
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
    }); // This will fail
  });
});

suite("toBeTruthy", () => {
  test("should pass", () => {
    expect(true).toBeTruthy(); // This will pass
  });

  test("should fail", () => {
    expect(false).toBeTruthy(); // This will fail
  });
});

suite("toThrow", () => {
  test("should pass", () => {
    expect(() => {
      throw new Error("Sour expect!");
    }).toThrow("Sour expect!");
  });

  test("should fail", () => {
    expect(() => {}).toThrow("Expected sour expect but got none"); // This will fail
  });

  test("should fail on dif err", () => {
    expect(() => {
      throw new Error("A different error!");
    }).toThrow("Sour expect!");
  });
});

suite("notToThrow", () => {
  test("should pass", () => {
    expect(() => {}).notToThrow("Expected no error but got one"); // This will pass
  });

  test("should fail", () => {
    expect(() => {
      throw new Error("Sweet expect!");
    }).notToThrow("Sweet expect!"); // This will fail
  });

  test("should fail on dif error", () => {
    expect(() => {
      throw new Error("A different error!");
    }).notToThrow("Sour expect!");
  });
});

suite("toHaveProperties", () => {
  test("should pass", () => {
    const suite = {
      sweetness: "high",
      acidity: "medium",
      aroma: "citrus",
    };

    expect(suite).toHaveProperties({
      sweetness: "high",
      aroma: "citrus",
    }); // This will pass
  });

  test("should fail", () => {
    const suite = {
      sweetness: "high",
      acidity: "medium",
      aroma: "citrus",
    };

    expect(suite).toHaveProperties({
      aroma: "berry",
    }); // This will fail
  });
});
