module.exports.checkAdmin = (req, res, next) => {
  try {
    const { isAdmin } = req.user;
    if (!isAdmin) {
      return next(new ErrorResponse("You are not admin", 401));
    }
    next();
  } catch (e) {
    next(e);
  }
};
