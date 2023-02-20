const express = require("express");

// Add the index router
const indexRouter = express.Router();

/* ----- GET Routes ----- */

// Handle the GET request for the home page
indexRouter.get("/", (req, res) => {
  // Render the main index page
  return res.status(200).render("index");
});

// Handle the GET request for any other unspecified routes
indexRouter.get("*", (req, res) => {
  // Render the error page
  return res
    .status(404)
    .render("error", { code: "404", message: "Page not found." });
});

// Export the router
module.exports = indexRouter;
