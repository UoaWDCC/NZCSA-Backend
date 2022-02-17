/* eslint-disable object-shorthand */
const { GoogleSpreadsheet } = require("google-spreadsheet");
const addUserToGooleSheetUtil = require("../utils/addUserToGoogleSheetUtil");

/**
 *
 * @route   api/admin/get-google-sheet
 * @desc    get data from google sheet, need to first set values in config.env
 * @access  admin/private
 */
exports.getGoogleSheet = async (req, res, next) => {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);

  const data = []; // the data to return

  try {
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
    });
    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByIndex[0];

    const rows = await sheet.getRows();
    await sheet.loadHeaderRow();
    let { headerValues } = sheet;
    const { rowCount } = sheet;
    headerValues = headerValues.filter((value) => value); // remove empty string headers

    rows.forEach((row) => {
      const rowItem = {}; // Row in google sheet
      headerValues.forEach((headerValue) => {
        rowItem[headerValue] = row[headerValue]; // process each column for the current row
      });
      data.push(rowItem); // Add row object to data array
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

exports.addUserToGooleSheet = async (req, res, next) => {
  try {
    const { name, wechatId, gender, googleSheetId } = req.body;

    await addUserToGooleSheetUtil(name, wechatId, gender, googleSheetId);

    res.status(200).json({ success: true });
  } catch (e) {
    res.status(400).json({ success: false });
    console.log(e);
  }
};
