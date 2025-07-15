suite("logging tests", () => {
  test("should pass", () => {
    console.log("This is a test log");
    expect(1).toBe(1);
  });

  test("should pass", () => {
    console.warn("This is a test warning");
    expect(2).toBe(2);
  });

  test("should pass", () => {
    console.error("This is a test error");
    expect(3).toBe(3);
  });
});
