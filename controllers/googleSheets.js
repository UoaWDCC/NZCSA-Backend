const { GoogleSpreadsheet } = require("google-spreadsheet");

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);

exports.getGoogleSheet = async (req, res, next) => {
  const data = [];

  try {
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
    });
    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByIndex[0];

    const rows = await sheet.getRows();
    await sheet.loadHeaderRow();
    const { headerValues, rowCount } = sheet;

    rows.forEach((row) => {
      const rowItem = {};
      headerValues.forEach((headerValue) => {
        rowItem[headerValue] = row[headerValue];
      });
      data.push(rowItem);
    });

    res.status(200).json({
      success: true,
      docTitle: doc.title,
      sheetTitle: sheet.title,
      rowCount,
      headerValues,
      data,
    });
  } catch (e) {
    next(e);
  }
};
