const mongoose = require("mongoose");

// Create local strategy for authenticating using email or username and password
const LocalStrategy = require("passport-local").Strategy;

// Import the user models
const Customer = mongoose.model("Customer");
const Vendor = mongoose.model("Vendor");

// Configure the passport to use various local strategies for different users
const configPassport = (passport) => {
  // Store user information in sessions
  passport.serializeUser((user, done) => {
    done(null, { _id: user._id, role: user.constructor.modelName });
  });

  // Retrieve user data from sessions
  passport.deserializeUser((user, done) => {
    // Search from customer database
    if (user.role === "Customer") {
      Customer.findById(user._id, function (err, user) {
        done(err, user);
      });
      // Search from vendor database
    } else if (user.role === "Vendor") {
      Vendor.findById(user._id, function (err, user) {
        done(err, user);
      });
      // Unidentified user type
    } else {
      done({ errors: "No entity found." }, null);
    }
  });

  // Handle login for customer
  passport.use(
    "customer-login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
      },
      (req, email, password, done) => {
        // Search for the customer instance in the database
        Customer.findOne({ email: email }, function (err, user) {
          if (err) {
            return done(err);
          }
          // Wrong email
          if (!user) {
            return req.res.status(401).json({
              success: false,
              message: ["You have entered an invalid username or password."],
            });
          }
          // Wrong password
          if (!user.validPassword(password)) {
            return req.res.status(401).json({
              success: false,
              message: ["You have entered an invalid username or password."],
            });
          }
          // User is found and authenticated
          else {
            done(null, user);
            return req.res.status(200).json({
              success: true,
              message: ["You have successfully logged in."],
            });
          }
        });
      }
    )
  );

  // Handle login for vendor
  passport.use(
    "vendor-login",
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
        passReqToCallback: true,
      },
      (req, username, password, done) => {
        // Search for the vendor instance in the database
        Vendor.findOne({ username: username }, function (err, user) {
          if (err) {
            return done(err);
          }
          // Wrong username
          if (!user) {
            return req.res.status(401).json({
              success: false,
              message: ["You have entered an invalid username or password."],
            });
          }
          // Wrong password
          if (!user.validPassword(password)) {
            return req.res.status(401).json({
              success: false,
              message: ["You have entered an invalid username or password."],
            });
          }
          // User is found and authenticated
          else {
            done(null, user);
            return req.res.status(200).json({
              success: true,
              message: ["You have successfully logged in."],
            });
          }
        });
      }
    )
  );

  // Handle sign up for new customer
  passport.use(
    "customer-signup",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
      },
      (req, email, password, done) => {
        // Search for customer with the same email in the database
        Customer.findOne({ email: email }, function (err, user) {
          if (err) {
            return done(err);
          }
          // Email is taken
          if (user) {
            return req.res.status(409).json({
              success: false,
              message: ["The email address you have entered is already taken."],
            });
          } else {
            // Construct a new customer instance with the given details
            const customer = new Customer({
              email: email,
              firstName: req.body.firstName,
              lastName: req.body.lastName,
            });
            // Hash the password before storing it
            customer.password = customer.generateHash(password);
            // Save customer to database
            customer.save((err) => {
              if (err) {
                return done(null, false);
              }
              return req.res.status(200).json({
                success: true,
                message: ["You have successfully signed up."],
              });
            });
          }
        });
      }
    )
  );

  // Handle sign up for new vendor
  passport.use(
    "vendor-signup",
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
        passReqToCallback: true,
      },
      (req, username, password, done) => {
        // Search for vendor with the same username in the database
        Vendor.findOne({ username: username }, function (err, user) {
          if (err) {
            return done(err);
          }
          // Username is taken
          if (user) {
            return req.res.status(409).json({
              success: false,
              message: ["The username you have entered is already taken."],
            });
          } else {
            // Construct a new vendor instance with the given username
            const vendor = new Vendor({
              username: username,
            });
            // Hash the password before storing it
            vendor.password = vendor.generateHash(password);
            // Save vendor to database
            vendor.save((err) => {
              if (err) {
                return done(null, false);
              }
              return req.res.status(200).json({
                success: true,
                message: ["You have successfully signed up."],
              });
            });
          }
        });
      }
    )
  );
};

// Export the config function
module.exports = {
  configPassport,
};
