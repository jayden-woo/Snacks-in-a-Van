// Check if a user is currently logged out
const isLoggedOut = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  return res.status(200).redirect(`/${req.originalUrl.split("/")[1]}`);
};

// Export the function
module.exports = isLoggedOut;
