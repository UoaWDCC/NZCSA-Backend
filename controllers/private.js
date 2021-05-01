module.exports.getPrivateData = (req, res, next) => {
  console.log('getPrivateData');
  const { username } = req.user;

  res.status(200).json({
    success: true,
    data: `Welcome ${username}`,
  });
};
