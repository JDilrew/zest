suite("timer tests", () => {
  test(`doesn't work in a vm`, async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(1).toBe(2);
  });
});
