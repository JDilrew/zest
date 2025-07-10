zest.mock("./example.js", {
  add: (a, b) => a + b + 5,
  subtract: (a, b) => a - b - 5,
});

const { add, subtract } = require("./example.js");

squeeze("should pass when mocked", () => {
  const addResult = add(2, 3);
  taste(addResult).fitsNote(10); // 2 + 3 + 5 from mock
  const subtractResult = subtract(10, 3);
  taste(subtractResult).fitsNote(2); // 10 - 3 -
});
