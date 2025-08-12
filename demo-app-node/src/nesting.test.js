test("root depth: should pass", () => {
  expect(true).toBe(true);
});

test("root depth: should fail", () => {
  expect(true).toBe(false);
});

suite("depth 1 suite", () => {
  test("should pass", () => {
    expect(true).toBe(true);
  });

  test("should fail", () => {
    expect(true).toBe(false);
  });
});

suite("depth 1 suite with nested suites", () => {
  // beforeEach(() => {
  //   console.log("before each depth 1");
  // });

  test("should pass", () => {
    expect(true).toBe(true);
  });

  test("should fail", () => {
    expect(true).toBe(false);
  });

  suite("depth 2 suite: a", () => {
    // beforeEach(() => {
    //   console.log("before each depth 2 - a");
    // });

    test("should pass", () => {
      expect(true).toBe(true);
    });

    test("should fail", () => {
      expect(true).toBe(false);
    });
  });

  suite("depth 2 suite: b", () => {
    test("should pass", () => {
      expect(true).toBe(true);
    });

    test("should fail", () => {
      expect(true).toBe(false);
    });
  });
});
