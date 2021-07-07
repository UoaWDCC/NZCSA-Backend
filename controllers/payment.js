const axios = require('axios');

exports.makePayment = async(req, res) => {

    const body = {
        "user_id": "U000004218",
        "wallet_id": "W000045674",
        "amount": "1.00",
        "payment_method": "alipay",
        "return_url": "https://merchantsite.com/checkout",
        "callback_url": "https://merchantsite.com/confirm",
        "merchant_reference": "dsi39ej430sks03",
        "ip": "122.122.122.1",
        "version": "2.0",
        "product_name": "Pinot Noir, Otago",
        "signature": "5fdd558530ff94f19332d17775fb13f1149d13a6cbd90a2054882a3320a2b4d3"
    }

    try {
        const response = await axios.post('https://api.latipay.net/v2/transaction', body)

        res.status(200).send(response.data);

    } catch (error) {
        res.status(200).json({
            success: false,
            info: "payment failed",
        })
    }
}