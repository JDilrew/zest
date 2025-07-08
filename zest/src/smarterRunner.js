await Promise.all(
  Array.from(testFiles).map(async (file) => {
    // ship this off to a parallel worker
    console.log(await runTest(file));
  })
);
