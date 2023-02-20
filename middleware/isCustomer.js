// Check if a user is currently logged in as a customer
const isCustomer = (req, res, next) => {
  // Check if the user is logged in
  if (!req.isAuthenticated()) {
    return res.status(401).redirect("/customer/login");
    // Check if the logged in user is a customer
  } else if (req.user.constructor.modelName != "Customer") {
    // Render error page or redirect to vendor main page
    return res.status(403).redirect("/vendor");
  }
  // User is an authenticated customer and can proceed
  return next();
};

// Export the function
module.exports = isCustomer;
