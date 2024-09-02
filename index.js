const express = require("express");
const bodyParser = require("body-parser");
const moment = require("moment-timezone");
const cronParser = require("cron-parser");
const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Helper function to generate Quartz-style cron expression
function generateQuartzCronExpression({
  seconds,
  minutes,
  hours,
  days,
  months,
  weeks,
  scheduleType
}) {
  let secondPart = seconds || "0";
  let minutePart = "*";
  let hourPart = "*";
  let dayPart = "*";
  let monthPart = "*";
  let weekPart = "?"; // '?' is used for no specific value in Quartz

  if (scheduleType === "min") {
    minutePart = `*/${minutes}`; // Every X minutes
  } else if (scheduleType === "hourly") {
    minutePart = minutes || "0";
    hourPart = hours || "*";
  } else if (scheduleType === "weekly") {
    minutePart = minutes || "0";
    hourPart = hours || "*";
    weekPart = weeks || "?";
  } else if (scheduleType === "monthly") {
    minutePart = "0";
    hourPart = "0";
    dayPart = days || "*";
    monthPart = months || "*";
  }

  // Quartz cron expression format:
  // second, minute, hour, day of month, month, day of week, year (optional)
  return `${secondPart} ${minutePart} ${hourPart} ${dayPart} ${monthPart} ${weekPart}`;
}

// Route for the main page
app.get("/", (req, res) => {
  res.render("index");
});

// Route to handle form submission
app.post("/schedule", (req, res) => {
  const {
    seconds,
    minutes,
    hours,
    days,
    months,
    weeks,
    scheduleType
  } = req.body;

  // Generate Quartz-like cron expression
  const cronExpression = generateQuartzCronExpression({
    seconds,
    minutes,
    hours,
    days,
    months,
    weeks,
    scheduleType
  });

  // Debugging output
  console.log(`Generated Quartz-like Cron Expression: ${cronExpression}`);

  try {
    // Use cron-parser to parse standard cron expressions
    // Note: cron-parser does not support Quartz directly, so we are converting Quartz to standard format
    const interval = cronParser.parseExpression(cronExpression, {
      currentDate: moment().tz("Asia/Kolkata").toDate()
    });

    // Calculate the next 10 occurrences
    const nextOccurrences = [];
    for (let i = 0; i < 10; i++) {
      const nextDate = interval.next().toDate();
      nextOccurrences.push(
        moment(nextDate).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")
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
