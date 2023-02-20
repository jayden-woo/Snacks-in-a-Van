// Packages or schema imports
const cookieParser = require("cookie-parser");
const exphbs = require("express-handlebars");
const express = require("express");
const flash = require("connect-flash-plus");
const helmet = require("helmet");
const passport = require("passport");
const session = require("express-session");
const app = express();
const server = require("http").createServer(app);
const socket = require("socket.io");
const io = socket(server);

// Listen to socket connections
io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

// Bind the io reference to every incoming request
app.use((req, res, next) => {
  req.io = io;
  return next();
});

// Define where static assets live
app.use(express.static("public"));

// Set the template engine to handlebars
app.engine(
  "hbs",
  exphbs({
    defaultlayout: "main",
    extname: "hbs",
    helpers: require(__dirname + "/public/js/helpers.js").helpers,
  })
);

// Set the view engine to hds engine above
app.set("view engine", "hbs");

// Declare sources for the HTTP Content-Security-Policy
const imgSrc = [
  "'self'",
  "data:",
  "https://source.unsplash.com/",
  "https://images.unsplash.com/",
];
const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  "'unsafe-eval'",
  "https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.js",
  "https://code.getmdl.io/1.3.0/material.min.js",
  "https://cdn.jsdelivr.net/npm/jquery",
  "https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js",
  "https://cdn.jsdelivr.net/npm/alertifyjs@1.13.1/build/alertify.min.js",
  "https://cdn.jsdelivr.net/npm/js-cookie@2/src/js.cookie.min.js",
  "https://cdn.jsdelivr.net/npm/es6-promise@4/",
  "https://api.mapbox.com/",
];

const workerSrc = ["'self'", "blob:"];

const connectSrc = [
  "'self'",
  "https://api.mapbox.com/",
  "https://events.mapbox.com/events/",
];

// Set up HTTP headers for web app security
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": imgSrc,
        "script-src": scriptSrc,
        "script-src-attr": scriptSrc,
        "script-src-elem": scriptSrc,
        "worker-src": workerSrc,
        "connect-src": connectSrc,
      },
    },
  })
);

// Use flash to store messages
app.use(flash());

// Set up database
const db = require("./models/db.js");

// Set up session to keep track of user data in between requests
app.use(cookieParser());
app.use(
  session({
    secret: "6HO^0GwL0c@8HYe^0z$I",
    resave: false,
    saveUninitialized: false,
    cookie: {
      // User should log in again after restarting the browser
      expires: false,
      // 2 hours before cookies expire and have to log in again
      maxAge: 2 * 60 * 60 * 1000,
      httpOnly: false,
    },
  })
);

// Configure the passport to handle authentication
app.use(passport.initialize());
app.use(passport.session());

// Set up the passport strategies
require("./config/passport").configPassport(passport);

// For reading body of requests
app.use(express.json()); // json format
app.use(express.urlencoded({ extended: true })); // urlencoded format

// Set up the routers
const customerRouter = require("./routes/customerRouter");
const vendorRouter = require("./routes/vendorRouter");
const indexRouter = require("./routes/indexRouter");

// Handler for customer requests and routes are added onto the end of '/customer'
app.use("/customer", customerRouter);

// Handler for vendor requests and routes are added onto the end of '/vendor'
app.use("/vendor", vendorRouter);

// Any other routes are redirected to the general index router
app.use("/", indexRouter);

// Dynamically set the port number or use static 3000 port for local testing
const port = process.env.PORT || 3000;

// Listen to any request to the web app
server.listen(port, () => {
  console.log("The web app is listening on port", port);
});

module.exports = app;
