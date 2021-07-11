const CryptoJS = require("crypto-js");

function getSignature(body) {
  const apiKey = process.env.LATIPAY_API_KEY;

  const data = body;

  const message = Object.keys(data)
    .filter(
      (item) =>
        data[item] != null && data[item] !== undefined && data[item] !== ""
    )
    .sort()
    .map((item) => `${item}=${data[item]}`)
    .join("&")
    .concat(apiKey);

  return CryptoJS.HmacSHA256(message, apiKey).toString();
}

module.exports = getSignature;
