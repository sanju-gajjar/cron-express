const express = require("express");
const bodyParser = require("body-parser");
const moment = require("moment-timezone");
const { CronJob } = require("cron");
const cronParser = require("cron-parser");
const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Helper function to generate basic cron expression
function generateCronExpression({
  minutes,
  hours,
  days,
  months,
  weeks,
  scheduleType
}) {
  let minutePart = "*";
  let hourPart = "*";
  let dayPart = "*";
  let monthPart = "*";
  let weekPart = "*";

  if (scheduleType === "min") {
    minutePart = `*/${minutes}`; // Every X minutes
  } else if (scheduleType === "hourly") {
    minutePart = minutes || "0";
    hourPart = hours || "*";
  } else if (scheduleType === "weekly") {
    minutePart = minutes || "0";
    hourPart = hours || "*";
    weekPart = weeks || "*";
  } else if (scheduleType === "monthly") {
    minutePart = "0";
    hourPart = "0";
    dayPart = days || "*";
    monthPart = months || "*";
  }

  return `${minutePart} ${hourPart} ${dayPart} ${monthPart} ${weekPart}`; // Standard cron format
}

// Route for the main page
app.get("/", (req, res) => {
  res.render("index");
});

// Route to handle form submission
app.post("/schedule", (req, res) => {
  const { minutes, hours, days, months, weeks, scheduleType } = req.body;

  // Generate cron expression
  const cronExpression = generateCronExpression({
    minutes,
    hours,
    days,
    months,
    weeks,
    scheduleType
  });

  // Debugging output
  console.log(`Generated Cron Expression: ${cronExpression}`);

  try {
    // Parse the cron expression
    const interval = cronParser.parseExpression(cronExpression, {
      tz: "Asia/Kolkata"
    });

    // Calculate the next 10 occurrences
    const nextOccurrences = [];
    for (let i = 0; i < 10; i++) {
      nextOccurrences.push(
        moment(interval.next().toDate()).format("YYYY-MM-DD HH:mm:ss")
      );
    }

    res.render("result", {
      error: undefined,
      cronExpression,
      nextOccurrences
    });
  } catch (err) {
    // Handle parsing errors
    console.error(`Error parsing cron expression: ${err.message}`);
    res.status(400).render("result", { error: "Invalid cron expression" });
  }
});

app.listen(port, () => {
  console.log(`Cron Express app listening at http://localhost:${port}`);
});
