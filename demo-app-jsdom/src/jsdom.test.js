suite("jsdom tests", () => {
  test("should update the counter", () => {
    // Simulate clicking the increment button
    const btn = document.getElementById("increment-btn");
    expect(btn).toBeTruthy();
    btn.click();

    // Check that the counter value updated
    const val = document.getElementById("counter-value").textContent;
    expect(Number(val)).toBe(1);

    // Check the JS value
    expect(window.getCounter()).toBe(1);
  });

  test("should increment multiple times", () => {
    const btn = document.getElementById("increment-btn");

    btn.click();
    btn.click();

    expect(Number(document.getElementById("counter-value").textContent)).toBe(
      3
    );
    expect(window.getCounter()).toBe(3);
  });
});
