const mongoose = require("mongoose");

// Import the models used
const Customer = mongoose.model("Customer");
const Vendor = mongoose.model("Vendor");

// Get the customer login page
const getCustomerLogIn = (req, res) => {
  return res.status(200).render("customer/login");
};

// Get the vendor login page
const getVendorLogIn = (req, res) => {
  return res.status(200).render("vendor/login");
};

// Get the customer signup page
const getCustomerSignUp = (req, res) => {
  return res.status(200).render("customer/signup");
};

// Get the vendor signup page
const getVendorSignUp = (req, res) => {
  return res.status(200).render("vendor/signup");
};

// Get the customer account details
const getCustomerAccount = (req, res) => {
  try {
    const details = {
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
    };
    return res.status(200).render("customer/account", { user: details });
  } catch (err) {
    // Error occurred during query
    return res
      .status(400)
      .render("error", { code: 400, message: "Oops! Something went wrong." });
  }
};
// Get the vendor account details
const getVendorAccount = (req, res) => {
  try {
    const details = {
      username: req.user.username,
      isOnline: req.user.isOnline ? "Open" : "Closed",
    };
    return res.status(200).render("vendor/account", { user: details });
  } catch (err) {
    // Error occurred during query
    return res
      .status(400)
      .render("error", { code: 400, message: "Oops! Something went wrong." });
  }
};

// Log out a user
const logOut = (req, res) => {
  req.logout();
  req.session.destroy();
  return res.status(200).redirect(`/${req.originalUrl.split("/")[1]}/login`);
};

// Update the account details of a customer
const customerUpdate = async (req, res) => {
  // Check if email is supplied
  if (req.body.email) {
    // Check if email is taken
    if (await Customer.findOne({ email: req.body.email })) {
      return res.status(409).json({
        success: false,
        message: ["The email address you have entered is already taken."],
      });
    }
    // Update email
    req.user.email = req.body.email;
  }

  // Check if old password is supplied
  if (req.body.oldPassword) {
    // Check if old password matches
    if (!req.user.validPassword(req.body.oldPassword)) {
      return res.status(401).json({
        success: false,
        message: ["The old password you have entered is incorrect."],
      });
    }
    // Update password
    req.user.password = req.user.generateHash(req.body.password);
  }

  // Update first name and last name if supplied
  if (req.body.firstName) req.user.firstName = req.body.firstName;
  if (req.body.lastName) req.user.lastName = req.body.lastName;

  // Save the user details
  req.user.save((err) => {
    if (err) {
      return res
        .status(400)
        .json({ success: false, message: ["Oops! Something went wrong."] });
    }
  });

  return res
    .status(200)
    .json({ success: true, message: ["Your details have been updated."] });
};

// Update the account details of a vendor
const vendorUpdate = async (req, res) => {
  // Check if username is supplied
  if (req.body.username) {
    // Check if username is taken
    if (await Vendor.findOne({ username: req.body.username })) {
      return res.status(409).json({
        success: false,
        message: ["The username you have entered is already taken."],
      });
    }
    // Update username
    req.user.username = req.body.username;
  }

  // Check if old password is supplied
  if (req.body.oldPassword) {
    // Check if old password matches
    if (!req.user.validPassword(req.body.oldPassword)) {
      return res.status(401).json({
        success: false,
        message: ["The old password you have entered is incorrect."],
      });
    }
    // Update password
    req.user.password = req.user.generateHash(req.body.password);
  }

  // Update availability if supplied
  if (req.body.isOnline) req.user.isOnline = req.body.isOnline;

  // Update location if supplied
  if (req.body.location) req.user.location = req.body.location;
  if (req.body.textAddress) req.user.textAddress = req.body.textAddress;

  // Save the user details
  req.user.save((err) => {
    if (err) {
      return res
        .status(400)
        .json({ success: false, message: ["Oops! Something went wrong."] });
    }
  });

  return res
    .status(200)
    .json({ success: true, message: ["Your details have been updated."] });
};

// Update vendor status between parked and unparked
const vendorPark = async (req, res) => {
  const { userId, isOnline, location, textAddress } = req.body;
  try {
    const user = await Vendor.findOne({ _id: userId });
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "VendorId doesn't exist" });
    // Update availability if supplied
    if (
      "isOnline" in req.body &&
      "location" in req.body &&
      "textAddress" in req.body
    ) {
      await Vendor.updateOne(
        { _id: userId },
        {
          $set: {
            location: location,
            isOnline: isOnline,
            textAddress: textAddress,
          },
        }
      );
      return res.status(200).json({
        success: true,
        message: ["Your parked successfully."],
        updatedVendor: await Vendor.findOne({ _id: userId }),
      });
    } else if ("isOnline" in req.body) {
      await Vendor.updateOne({ _id: userId }, { $set: { isOnline: isOnline } });
      return res.status(200).json({
        success: true,
        message: ["Your unparked successfully."],
        updatedVendor: await Vendor.findOne({ _id: userId }),
      });
    }
  } catch (err) {
    res.status(400).json({ error: "Database update failed" });
  }
};

// Export the controller functions
module.exports = {
  getCustomerLogIn,
  getVendorLogIn,
  getCustomerSignUp,
  getVendorSignUp,
  getCustomerAccount,
  getVendorAccount,
  logOut,
  customerUpdate,
  vendorUpdate,
  vendorPark,
};
