const express = require("express");
const bodyParser = require("body-parser");
const cronParser = require("cron-parser");
const moment = require("moment-timezone");
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Helper function to generate cron expression
function generateCronExpression({ minutes, hours, days, months, weeks }) {
  const minutePart =
    minutes && !isNaN(minutes)
      ? minutes.includes("/") ? minutes : `*/${minutes}`
      : "0";
  const hourPart = hours || "*";
  const dayPart = days || "*";
  const monthPart = months || "*";
  const weekPart = weeks || "*";

  return `${minutePart} ${hourPart} ${dayPart} ${monthPart} ${weekPart}`;
}

// Route for the main page
app.get("/*", (req, res) => {
  res.render("index");
});

// Route to handle form submission
app.post("/schedule", (req, res) => {
  const { minutes, hours, days, months, weeks } = req.body;

  // Generate cron expression
  const cronExpression = generateCronExpression({
    minutes: minutes || "*",
    hours: hours || "*",
    days: days || "*",
    months: months || "*",
    weeks: weeks || "*"
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
