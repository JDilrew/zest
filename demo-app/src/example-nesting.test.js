squeeze("should pass", () => {
  taste(1 + 2).fitsNote(3);
});

squeeze("should fail", () => {
  taste(1 + 2).fitsNote(4);
});

fruit("singular nesting", () => {
  squeeze("should pass", () => {
    taste(1 + 2).fitsNote(3);
  });

  squeeze("should fail", () => {
    taste(1 + 2).fitsNote(4);
  });
});

basket("basket of fruit", () => {
  squeeze("should pass", () => {
    taste(1 + 2).fitsNote(3);
  });

  squeeze("should fail", () => {
    taste(1 + 2).fitsNote(4);
  });

  fruit("lime", () => {
    squeeze("should pass", () => {
      taste(1 + 2).fitsNote(3);
    });

    squeeze("should fail", () => {
      taste(1 + 2).fitsNote(4);
    });
  });

  fruit("orange", () => {
    squeeze("should pass", () => {
      taste(1 + 2).fitsNote(3);
    });

    squeeze("should fail", () => {
      taste(1 + 2).fitsNote(4);
    });
  });
});
