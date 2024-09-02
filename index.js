const express = require("express");
const bodyParser = require("body-parser");
const cronParser = require("cron-parser");
const moment = require("moment-timezone");
const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Helper function to generate cron expression
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
  let weekPart = "?"; // Default value for day of the week

  if (scheduleType === "min") {
    minutePart = minutes || "*";
  } else if (scheduleType === "hourly") {
    minutePart = minutes || "*";
    hourPart = hours || "*";
  } else if (scheduleType === "weekly") {
    minutePart = minutes || "*";
    hourPart = hours || "*";
    weekPart = weeks || "?";
  } else if (scheduleType === "monthly") {
    minutePart = "*";
    hourPart = "*";
    dayPart = days || "*";
    monthPart = months || "*";
  }

  return `${minutePart} ${hourPart} ${dayPart} ${monthPart} ${weekPart}`;
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
    // Check if the cron expression is valid
    const interval = cronParser.parseExpression(cronExpression);
    const nextOccurrences = [];
    for (let i = 0; i < 10; i++) {
      const nextDate = interval.next().toDate();
      nextOccurrences.push(
        moment(nextDate).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")
      );
    }

    res.render("result", {
      error:undefined,
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
