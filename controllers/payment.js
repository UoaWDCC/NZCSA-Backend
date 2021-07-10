const axios = require("axios");
const getSignature = require("../utils/getSignature");
const ErrorResponse = require("../utils/errorResponse");

exports.makePayment = async (req, res, next) => {
  const { paymentMethod, paymentAmount } = req.body;
  const userId = process.env.LATIPAY_USER_ID;
  const walletId = process.env.LATIPAY_WALLET_ID;

  const body = {
    user_id: userId,
    wallet_id: walletId,
    amount: paymentAmount,
    payment_method: paymentMethod,
    return_url: "https://merchantsite.com/checkout",
    callback_url: "https://merchantsite.com/confirm",
    merchant_reference: "dsi39ej430sks03",
    ip: "122.122.122.1",
    version: "2.0",
    product_name: "NZCSA Membership",
  };

  const hash = getSignature(body);
  body.signature = hash;
  // console.log(hash)

  try {
    const response = await axios.post(
      "https://api.latipay.net/v2/transaction",
      body
    );
    if (response.data.code === 0) {
      res.send(response.data);
    } else {
      return next(new ErrorResponse(response.data.message, response.data.code));
    }
  } catch (error) {
    next(error);
  }
};
