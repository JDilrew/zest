import fs from "fs";
import path from "path";

suite("dom tests", () => {
  beforeEach(() => {
    // Put markup in the DOM
    const html = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf8");
    document.documentElement.innerHTML = html;

    // Execute the app code INTO the jsdom window
    const appJs = fs.readFileSync(path.resolve(__dirname, "index.js"), "utf8");
    window.eval(appJs); // runs in the jsdom global
  });

  test("should update the counter when clicking the button", () => {
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

  test("should increment the counter when clicking the button multiple times", () => {
    const btn = document.getElementById("increment-btn");

    btn.click();
    btn.click();
    btn.click();

    expect(Number(document.getElementById("counter-value").textContent)).toBe(
      3
    );
    expect(window.getCounter()).toBe(3);
  });
});
