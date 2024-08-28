const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from each demo's public directory
app.use(
  "/demo-00-P5",
  express.static(path.join(__dirname, "apps/demo-00-P5/public"))
);
app.use(
  "/demo-01-sensor-actuator",
  express.static(path.join(__dirname, "apps/demo-01-sensor-actuator/public"))
);

// Serve JavaScript modules from the 'lib' directory
app.use("/lib", express.static(path.join(__dirname, "lib")));

// Serve additional static assets from the 'assets' directory
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Redirect root to a default demo (optional)
app.get("/", (req, res) => {
  res.redirect("/demo-00-P5"); // Default to demo-00-P5 or a landing page
});

// Fallback to handle 404 errors
app.use((req, res) => {
  res.status(404).send("Page not found");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
