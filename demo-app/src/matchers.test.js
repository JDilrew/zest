const { add, subtract } = require("./example.js");

fruit("fitsNote", () => {
  squeeze("should pass", () => {
    taste(add(1, 2)).fitsNote(3);
  });

  squeeze("should fail", () => {
    taste(subtract(5, 2)).fitsNote(4); // This will fail
  });
});

fruit("fitsProfile", () => {
  squeeze("should pass", () => {
    taste({ name: "apple", color: "red" }).fitsProfile({
      name: "apple",
      color: "red",
    });
  });

  squeeze("should fail", () => {
    taste({ name: "banana", color: "yellow" }).fitsProfile({
      name: "apple",
      color: "red",
    }); // This will fail
  });
});

fruit("isJuicy", () => {
  squeeze("should pass", () => {
    taste(true).isJuicy(); // This will pass
  });

  squeeze("should fail", () => {
    taste(false).isJuicy(); // This will fail
  });
});

fruit("isSour", () => {
  squeeze("should pass", () => {
    taste(() => {
      throw new Error("Sour taste!");
    }).isSour("Sour taste!");
  });

  squeeze("should fail", () => {
    taste(() => {}).isSour("Expected sour taste but got none"); // This will fail
  });
});

fruit("isSweet", () => {
  squeeze("should pass", () => {
    taste(() => {}).isSweet("Expected no error but got one"); // This will pass
  });

  squeeze("should fail", () => {
    taste(() => {
      throw new Error("Sweet taste!");
    }).isSweet("Sweet taste!"); // This will fail
  });
});

fruit("hasNotesOf", () => {
  squeeze("should pass", () => {
    const obj = { notes: ["fresh", "crisp"] };
    taste(obj).hasNotesOf("fresh"); // This will pass
  });

  squeeze("should fail", () => {
    const obj = { notes: ["fresh", "crisp"] };
    taste(obj).hasNotesOf("rotten"); // This will fail
  });
});

fruit("hasProfileOf", () => {
  squeeze("should pass", () => {
    const fruit = {
      profile: {
        sweetness: "high",
        acidity: "medium",
        aroma: "citrus",
      },
    };

    taste(fruit).hasProfileOf({
      sweetness: "high",
      aroma: "citrus",
    }); // This will pass
  });

  squeeze("should fail", () => {
    const fruit = {
      profile: {
        sweetness: "high",
        acidity: "medium",
        aroma: "citrus",
      },
    };

    taste(fruit).hasProfileOf({
      aroma: "berry",
    }); // This will fail
  });
});
