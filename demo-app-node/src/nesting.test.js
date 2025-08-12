test("root depth: should pass", () => {
  expect(1 + 2).toBe(3);
});

test("root depth: should fail", () => {
  expect(1 + 2).toBe(4);
});

suite("depth 1 suite", () => {
  test("should pass", () => {
    expect(1 + 2).toBe(3);
  });

  test("should fail", () => {
    expect(1 + 2).toBe(4);
  });
});

suite("depth 1 suite with nested depth 2 suites", () => {
  test("should pass", () => {
    expect(1 + 2).toBe(3);
  });

  test("should fail", () => {
    expect(1 + 2).toBe(4);
  });

  suite("depth 2 suite: a", () => {
    test("should pass", () => {
      expect(1 + 2).toBe(3);
    });

    test("should fail", () => {
      expect(1 + 2).toBe(4);
    });
  });

  suite("depth 2 suite: b", () => {
    test("should pass", () => {
      expect(1 + 2).toBe(3);
    });

    test("should fail", () => {
      expect(1 + 2).toBe(4);
    });
  });
});
