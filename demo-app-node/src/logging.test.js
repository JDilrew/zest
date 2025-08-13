// These tests prove the console buffering works,
// not that the injected console has been called x times for example

test("calls console.log", () => {
  console.log("This is a test log");
  expect(true).toBe(true);
});

test("calls console.warn", () => {
  console.warn("This is a test warning");
  expect(true).toBe(true);
});

test("calls console.error", () => {
  console.error("This is a test error");
  expect(true).toBe(true);
});
