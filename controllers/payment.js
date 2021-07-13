/* eslint-disable camelcase */
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const getSignature = require("../utils/getSignature");
const ErrorResponse = require("../utils/errorResponse");
const Orders = require("../models/Orders");
const Users = require("../models/User");

exports.createOrder = async (req, res, next) => {
  const { merchantReference, userId, paymentMethod } = req.body;
  console.log(req.body);

  // await Orders.deleteMany({});

  // await Orders.find({}, (error, events) => {
  //   const eventMap = {};
  //   events.forEach((event) => {
  //     eventMap[event._id] = event;
  //   });
  //   res.send(eventMap);
  // });

  try {
    await Orders.create({
      merchantReference,
      userId,
      orderStatus: false,
      paymentMethod,
    });
    res.status(200).json({
      success: true,
      data: `order ${merchantReference} added`,
    });
  } catch (error) {
    next(error);
  }
};

exports.makePayment = async (req, res, next) => {
  const { paymentMethod, paymentAmount, userId } = req.body;
  const latipayUserId = process.env.LATIPAY_USER_ID;
  const walletId = process.env.LATIPAY_WALLET_ID;
  const serverUrl = process.env.PAYMENT_TEST_SERVER;
  const clientUrl = process.env.PAYMENT_TEST_CLIENT;

  if (!paymentAmount || !paymentMethod) {
    return next(new ErrorResponse("Invalid body", 400));
  }

  if (paymentAmount < 0.01) {
    return next(new ErrorResponse("Invalid payment amount", 400));
  }

  const body = {
    user_id: latipayUserId,
    wallet_id: walletId,
    amount: paymentAmount,
    payment_method: paymentMethod,
    return_url: `${clientUrl}/checkout`,
    callback_url: `${serverUrl}/api/payment/payment-update`,
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
        data.payment_url = `${host_url}/${nonce}`;

        // Add to orders collection
        // await Orders.create({
        // })

        res.status(200).json({
          success: true,
          data: response.data,
        });
      } else {
        return next(new ErrorResponse("Signature Validation failed", 400));
      }
    } else {
      return next(new ErrorResponse(response.data.message, response.data.code));
    }
  } catch (error) {
    next(error);
  }
};

exports.paymentNotification = (req, res) => {
  const { body } = req;
  console.log(body);

  const {
    status,
    merchant_reference,
    payment_method,
    currency,
    amount,
    signature,
  } = req.body;
  // console.log(status);

  const message =
    merchant_reference + payment_method + status + currency + amount;

  const validateHash = getSignature(message, false);
  console.log(validateHash);
  console.log(signature);

  if (signature === validateHash && status === "paid") {
    console.log("signature validation successful, making the user a member");

    try {
      const order = Orders.findOne({ merchantReference: merchant_reference });

      if (!order) {
        console.log("order not found");
      }

      const { userId } = order;
      const user = Users.findOne({ _id: userId });

      user.isMembership = true;
      user.save();
      order.orderStatus = "paid";
      order.save();
    } catch (error) {
      console.log(error);
    }
  } else {
    console.log("signature validation failed or order is not paid");
    // return res.status(400).send("signature validation failed");
  }

  return res.status(200).send("sent");
};

// Sample response for payment notification webhook
// Latipay server calls this webhook approximately every 30 seconds
// {
//   merchant_reference: '0f2b6930-8ee0-4e1f-ad23-2b6d9d4385d6',
//   status: 'paid',
//   currency: 'NZD',
//   amount: '0.01',
//   amount_cny: '0.05',
//   rate: '5.000000',
//   payment_method: 'polipay',
//   signature: '6cbc7ca30bf5328dca8926958bbfea68fc2ef22c844c2886fef41b0c799b9685',
//   pay_time: '2021-07-11 23:45:44',
//   order_id: '2021071100011210'
// }

exports.validateRedirect = async (req, res, next) => {
  const {
    merchant_reference,
    payment_method,
    status,
    currency,
    amount,
    signature,
  } = req.body;

  const message =
    merchant_reference + payment_method + status + currency + amount;

  const hash = getSignature(message, false);

  console.log(hash);
  console.log(signature);

  if (hash !== signature) {
    return next(new ErrorResponse("Signature validation failed", 400)); // return error if request did not come from Latipay
  }

  return res.status(200).json({
    success: true,
    message: "signature validation successful",
  });
};
