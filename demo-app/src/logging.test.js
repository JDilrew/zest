fruit("logging tests", () => {
  squeeze("should pass", () => {
    console.log("This is a test log");
    taste(1).fitsNote(1);
  });

  squeeze("should pass", () => {
    console.warn("This is a test warning");
    taste(2).fitsNote(2);
  });

  squeeze("should pass", () => {
    console.error("This is a test error");
    taste(3).fitsNote(3);
  });
});
