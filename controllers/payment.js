/* eslint-disable camelcase */
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const getSignature = require("../utils/getSignature");
const ErrorResponse = require("../utils/errorResponse");
const Orders = require("../models/Orders");
const Users = require("../models/User");
const Event = require("../models/Events");
const Log = require("../models/Logs");
const addUserToGooleSheetUtil = require("../utils/addUserToGoogleSheetUtil");

// Api functions for use in production by user

// add relevant order information to order database
exports.createOrder = async (req, res, next) => {
  const {
    merchantReference,
    userId,
    paymentMethod,
    eventId,
    orderType,
    amount,
  } = req.body;
  console.log(req.body);

  try {
    await Orders.create({
      merchantReference,
      orderStatus: "pending",
      paymentMethod,
      userId,
      eventId,
      amount,
      orderType,
    });
    res.status(200).json({
      success: true,
      data: `order ${merchantReference} added`,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// called by frontend when the user makes a payment for a product
exports.makePayment = async (req, res, next) => {
  const { paymentMethod, paymentAmount, productName } = req.body;
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

  const merchantReference = uuidv4();

  const body = {
    user_id: latipayUserId,
    wallet_id: walletId,
    payment_method: paymentMethod,
    amount: paymentAmount,
    return_url: `${clientUrl}/checkout`,
    callback_url: `${serverUrl}/api/payment/payment-update`,
    merchant_reference: merchantReference,
    ip: "122.122.122.1",
    version: "2.0",
    product_name: productName,
  };

  if (paymentMethod === "wechat") {
    body.present_qr = "1";
  }

  const hash = getSignature(body, true);
  body.signature = hash;
  console.log(body);

  try {
    const response = await axios.post(
      "https://api.latipay.net/v2/transaction",
      body
    );

    console.log(response.data);
    if (response.data.code === 0) {
      const { nonce, host_url, signature } = response.data;
      const validateMessage = nonce + host_url;
      const validateHash = getSignature(validateMessage, false);

      // console.log(validateHash);
      if (signature === validateHash) {
        const { data } = response;
        const payment_url = `${host_url}/${nonce}`;

        // Add to orders collection
        // await Orders.create({
        // })

        res.status(200).json({
          success: true,
          data,
          payment_url,
          merchantReference,
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

// Webhook called by latipay, see latipay documentation for the body of the request, must always return status 200 with message "sent"
exports.paymentNotification = async (req, res) => {
  const { body } = req;
  console.log(body);

  const {
    status,
    merchant_reference,
    payment_method,
    currency,
    amount,
    signature,
    pay_time,
  } = req.body;
  console.log(status);

  const message =
    merchant_reference + payment_method + status + currency + amount;

  const validateHash = getSignature(message, false);
  console.log(validateHash);
  console.log(signature);

  if (signature !== validateHash) {
    // validate if message came from Latipay server
    console.log("signature validation successful");
    return res.status(400).send("signature validation failed");
  }

  const order = await Orders.findOne({
    merchantReference: merchant_reference,
  });

  if (!order) {
    console.log("order not found");
    return res.status(404).send("order not found");
  }

  if (status === "paid") {
    // Only dispatch order if transaction is successfully processed to bank account
    try {
      const { userId, eventId, orderType } = order;
      const user = await Users.findOne({ _id: userId });

      if (orderType === "membership-payment") {
        // handle membership registration
        console.log(user);
        console.log(order);

        user.isMembership = true;
        user.save();
        console.log(`membership added to ${userId}`);
      } else if (orderType === "event-payment") {
        console.log(user);

        // handle event registration
        console.log("event-payment");
        const event = await Event.findOne({ _id: eventId });

        if (!user.attendedEvents.includes(eventId)) {
          // check if already register
          user.attendedEvents.push(eventId);
          if (event.googleSheetUrl !== undefined) {
            console.log(event.googleSheetUrl);
            console.log(
              user.firstname,
              user.lastname,
              user.wechatId,
              user.gender,
              event.googleSheetUrl
            );
            const name = user.firstname + user.lastname;
            await addUserToGooleSheetUtil(
              name,
              user.wechatid,
              user.gender,
              event.googleSheetUrl
            );
          }
        }
        if (!event.userList.includes(eventId)) {
          // check if already register
          event.userList.push(user._id);
        }

        await event.save();
        await user.save();
        console.log(`event ${eventId} Added.`);
      } else {
        console.log("invalid order type");
      }
    } catch (error) {
      console.log(error);
    }
  }

  // executes regardless of outcome to update order
  order.amount = amount;
  order.orderStatus = status;
  order.payTime = pay_time;
  order.save();

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

// called by frontend when redirected after payment, verifies if they were redirected from latipay
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

// get individual order
exports.isOrderPaid = async (req, res) => {
  try {
    const order = await Orders.findOne({
      merchantReference: req.params.id,
    });

    if (order.orderStatus === "paid") {
      res.status(200).send(order);
    } else {
      return res.status(500).send(order);
    }
  } catch (error) {
    res.status(404).json({
      success: false,
      error,
    });
  }
};

// Api functions for developers to test payment

// get all current orders
exports.getOrder = async (req, res) => {
  const merchantReference = req.body;

  try {
    await Orders.find({}, (error, events) => {
      const eventMap = {};
      events.forEach((event) => {
        eventMap[event._id] = event;
      });
      res.send(eventMap);
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      info: error.message,
    });
  }
};

// delete all orders in order database
exports.deleteAllOrders = async (req, res, next) => {
  try {
    await Orders.deleteMany({});
    return res.status(200).json({
      success: true,
      message: "all orders deleted",
    });
  } catch (error) {
    next(error);
  }
};

// remove membership from yourself
exports.removeMembership = (req, res, next) => {
  try {
    const { user } = req;
    user.isMembership = false;
    user.save();
    return res.status(200).json({
      success: true,
      message: `membership removed for user ${user._id}`,
    });
  } catch (error) {
    next(error);
  }
};

// remove yourself from specific event
exports.removeFromEvent = async (req, res, next) => {
  const { eventId } = req.body;

  try {
    const { user } = req;
    const event = await Event.findOne({ _id: eventId });

    if (!event) {
      return next(new ErrorResponse("Event not found", 404));
    }

    const lst = event.userList;
    const userIndex = lst.indexOf(user._id);
    const eventIndex = user.attendedEvents.indexOf(eventId);

    event.userList.splice(userIndex, 1);
    user.attendedEvents.splice(eventIndex, 1);

    await event.save();
    await user.save();

    res.status(200).json({
      success: true,
      data: `event ${eventId} removed for you.`,
    });
  } catch (error) {
    next(error);
  }
};
