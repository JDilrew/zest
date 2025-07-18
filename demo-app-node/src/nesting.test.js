test("should pass", () => {
  expect(1 + 2).toBe(3);
});

test("should fail", () => {
  expect(1 + 2).toBe(4);
});

suite("singular nesting", () => {
  test("should pass", () => {
    expect(1 + 2).toBe(3);
  });

  test("should fail", () => {
    expect(1 + 2).toBe(4);
  });
});

suite("suite of suite", () => {
  test("should pass", () => {
    expect(1 + 2).toBe(3);
  });

  test("should fail", () => {
    expect(1 + 2).toBe(4);
  });

  suite("lime", () => {
    test("should pass", () => {
      expect(1 + 2).toBe(3);
    });

    test("should fail", () => {
      expect(1 + 2).toBe(4);
    });
  });

  suite("orange", () => {
    test("should pass", () => {
      expect(1 + 2).toBe(3);
    });

    test("should fail", () => {
      expect(1 + 2).toBe(4);
    });
  });
});
