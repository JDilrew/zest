test("reports result from the root", () => {
  expect(true).toBe(true);
});

suite("suite 1", () => {
  test("reports result inside of a suite", () => {
    expect(true).toBe(true);
  });
});

suite("suite 2 with nested suites", () => {
  // beforeEach(() => {
  //   console.log("beforeEach at root");
  // });

  test("reports result inside of a suite that also has nesting", () => {
    expect(true).toBe(true);
  });

  suite("nested suite: 1", () => {
    // beforeEach(() => {
    //   console.log("beforeEach in nesting");
    // });

    test("reports result inside of a nested suite", () => {
      expect(true).toBe(true);
    });
  });

  suite("nested suite: 2", () => {
    test("reports result inside of a nested suite", () => {
      expect(true).toBe(true);
    });
  });
});
