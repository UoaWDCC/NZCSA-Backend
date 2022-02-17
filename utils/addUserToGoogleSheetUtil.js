const { GoogleSpreadsheet } = require("google-spreadsheet");

const addUserToGooleSheetUtil = async (
  name,
  wechatId,
  gender,
  googleSheetId
) => {
  let doc;
  if (googleSheetId.includes("/")) {
    const googleSheetIdSplit = googleSheetId.split("/");
    console.log(googleSheetIdSplit);
    const { length } = googleSheetIdSplit;
    let googleSheetIdOnly = googleSheetId;
    googleSheetIdOnly = googleSheetIdSplit[length - 2];
    console.log(googleSheetIdOnly, name, wechatId, gender, googleSheetId);
    doc = new GoogleSpreadsheet(googleSheetIdOnly);
  } else {
    doc = new GoogleSpreadsheet(googleSheetId);
  }

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  });
  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[0];

  const row = {
    Name: name,
    WechatId: wechatId,
    Gender: gender,
  };

  await sheet.addRow(row);
};

module.exports = addUserToGooleSheetUtil;
