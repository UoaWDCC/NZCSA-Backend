module.exports.getPrivateData = (req, res, next) => {
  console.log('getPrivateData');
  res.status(200).json({
    success: true,
    data: 'You got access for this data',
  });
};
