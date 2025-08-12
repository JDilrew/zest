import { scheduleTests } from "./testScheduler.js";

async function runZest(testContexts, silent) {
  // Process any global setup or configuration here if needed

  const results = await scheduleTests(testContexts, silent);

  //   console.log("Test run completed.", results);
  // TODO: report the results
}

export { runZest };
