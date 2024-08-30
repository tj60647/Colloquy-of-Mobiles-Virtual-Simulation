const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === "production" &&
    req.headers["x-forwarded-proto"] !== "https"
  ) {
    return res.redirect("https://" + req.headers.host + req.url);
  }
  next();
});

// Serve static files from each demo's public directory
app.use(
  "/demo-00-P5",
  express.static(path.join(__dirname, "apps/demo-00-P5/public"))
);
app.use(
  "/demo-01-sensor-actuator",
  express.static(path.join(__dirname, "apps/demo-01-sensor-actuator/public"))
);
app.use(
  "/demo-02-oscillator",
  express.static(path.join(__dirname, "apps/demo-02-oscillator/public"))
);
app.use(
  "/demo-03-transform",
  express.static(path.join(__dirname, "apps/demo-03-transform/public"))
);
app.use(
  "/demo-04-drives",
  express.static(path.join(__dirname, "apps/demo-04-drives/public"))
);

// Serve JavaScript modules from the 'lib' directory
app.use("/lib", express.static(path.join(__dirname, "lib")));

// Serve additional static assets from the 'assets' directory
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Serve the 'public' directory for the home page
app.use(express.static(path.join(__dirname, "apps/public")));

// Serve the home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "apps/public/index.html")); // Adjust the path as needed
});

// Fallback to handle 404 errors
app.use((req, res) => {
  res.status(404).send("Page not found");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
