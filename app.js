// packages or schema imports
const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
// const helmet = require('helmet')
const session = require("express-session");
const app = express();
const bodyParser = require("body-parser");

const resetRespnse = require("./middleware/resetResponse");

// we will use passport.js, so include it
// const passport = require('passport');

// // set up cors
// var whitelist = ['https://snacksinavan-generator.herokuapp.com','http://localhost:3000']
// app.use(cors({
//        origin: whitelist,
//        // access-control-allow-credentials:true
//        credentials: true,
//        optionSuccessStatus: 200
//    }
// ))

// set up HTTP headers for web app security
// app.use(helmet())

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(express.static("public")); // define where static assets live

const exphbs = require("express-handlebars");

app.engine(
  "hbs",
  exphbs({
    defaultlayout: "main",
    extname: "hbs",
    helpers: require(__dirname + "/public/js/helpers.js").helpers,
  })
);

app.set("view engine", "hbs");

// we can pass messages between app and callbacks
// we will not use it for this app
// const flash = require("connect-flash-plus");

// // for using JSON Web Tokens (JWT)
// const jwt = require("jsonwebtoken");

// // we use a few enviornment variables
// const dotenv = require("dotenv").config();

// configure passport authenticator
// require('./config/passport')(passport);

// set up HTTP headers for web app security
// app.use(helmet())

// for keeping track of data in between pages
app.use(cookieParser());
app.use(
  session({
    secret: 'INFO30005 Web-App',
    resave: false,
    saveUninitialized: false,
    cookie: {
      // user should log in again after restarting the browser
    //   expires: false,
      // 2 hours before cookies expire and have to log in again
      maxAge: 2 * 60 * 60 * 1000,
    },
  }),
);

// middleware
// app.use(function(req, res, next) {
//     const route = req.url || ''
//     const { user = {} } = req.session;

//     if (route.indexOf('/customer') > -1) {
//         if (user._id) {
//             if (route === '/customer/login') {
//                 res.redirect('/customer/map');
//             }
//         } else {
//             if (route !== '/customer/login') {
//               res.redirect('/customer/login');
//             }
//         }
          
//     } else {}
//     console.log('middleware', req.url, req.session);
//     next()
// })

// //middleware that's required for passport to operate
// app.use(passport.initialize());

// // middleware to store user object
// app.use(passport.session());

// // use flash to store messages
// app.use(flash());

// // for reading body of requests
// app.use(express.urlencoded({ extended: true })) // replaces body-parser

// // for reading body of requests
// app.use(express.json())

// set up database
const db = require("./models/db.js");

// set up the middlewares
const resetResponse = require("./middleware/resetResponse");
const isLoggedIn = require("./middleware/isLoggedIn");

// set up customer and vendor routes
const customerRouter = require("./routes/customerRouter");
const vendorRouter = require("./routes/vendorRouter");

// handler for GET home page
app.get("/", (req, res) => {
  console.log("connected");
  res.render("index");
});

// handler for GET request to log out a user
app.get("/logout", isLoggedIn, (req, res) => {
  // kill the current session so a new session could be created on next req
  req.session.destroy();
  console.log("User has successfully logged out");
  return res.status(200).json({ success: true, errors: [] });
});

// handler for customer and vendor requests
// customer routes are added onto the end of '/customer'
app.use("/customer", resetRespnse, customerRouter); //, resetResponse
// vendor routes are added onto the end of '/vendor'
app.use("/vendor", resetRespnse, vendorRouter); //, resetResponse

app.all("*", (req, res) => {
  // 'default' route to catch user errors
  res
    .status(404)
    .render("error", { errorCode: "404", message: "That route is invalid." });
});

// dynamically set the port number or use static 8080 port for local testing
const port = process.env.PORT || 8080;

// listen to any request to the web app
app.listen(port, () => {
  console.log("The web app is listening on port", port);
});
