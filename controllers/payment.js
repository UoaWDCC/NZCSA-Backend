/* eslint-disable camelcase */
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
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
    return_url: "http://localhost:5000",
    callback_url: "http://localhost:5000/api/payment/confirm",
    merchant_reference: uuidv4(),
    ip: "122.122.122.1",
    version: "2.0",
    product_name: "NZCSA Membership",
  };

  if (paymentMethod === "wechat") {
    body.present_qr = "1";
  }

  const hash = getSignature(body, true);
  body.signature = hash;
  // console.log(body);

  try {
    const response = await axios.post(
      "https://api.latipay.net/v2/transaction",
      body
    );

    // console.log(response.data)
    if (response.data.code === 0) {
      const { nonce, host_url, signature } = response.data;
      const validateMessage = nonce + host_url;
      const validateHash = getSignature(validateMessage, false);

      // console.log(validateHash);
      if (signature === validateHash) {
        const { data } = response;
        data.redirect_url = `${host_url}/${nonce}`;

        res.status(200).json({
          success: true,
          data: response.data,
        });
      } else {
        return next(new ErrorResponse("Signature Validation failed", 500));
      }
    } else {
      return next(new ErrorResponse(response.data.message, response.data.code));
    }
  } catch (error) {
    next(error);
  }
};

exports.paymentNotification = async (req, res, next) => {
  const { body } = req;
  console.log(body);
  next(body);
};
