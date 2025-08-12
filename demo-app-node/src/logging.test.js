suite("logging tests", () => {
  test("should pass", () => {
    console.log("This is a test log");
    expect(true).toBe(true);
  });

  test("should pass", () => {
    console.warn("This is a test warning");
    expect(true).toBe(true);
  });

  test("should pass", () => {
    console.error("This is a test error");
    expect(true).toBe(true);
  });
});
