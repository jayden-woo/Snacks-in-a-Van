// Check if a user is currently logged in as a vendor
const isVendor = (req, res, next) => {
  // Check if the user is logged in
  if (!req.isAuthenticated()) {
    return res.status(401).redirect("/vendor/login");
    // Check if the logged in user is a vendor
  } else if (req.user.constructor.modelName != "Vendor") {
    // Render error page or redirect to customer main page
    return res.status(403).redirect("/customer");
  }
  // User is an authenticated vendor and can proceed
  return next();
};

// Export the function
module.exports = isVendor;
