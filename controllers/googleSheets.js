const { GoogleSpreadsheet } = require("google-spreadsheet");
const { promisify } = require("util");
const creds = require("../creds.json");

const doc = new GoogleSpreadsheet(
  "1aVwKxtqFGVGQTWu94B65oHWVGkCbshJgR49z1sHgVt8"
);

function printStudent(student) {
  console.log(`Name: ${student["Student Name"]}`);
  console.log(`Major: ${student.Major}`);
  console.log(`Home State: ${student["Home State"]}`);
  console.log(`-----------`);
}

exports.getGoogleSheet = async (req, res, next) => {
  try {
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo(); // loads document properties and worksheets
    console.log(doc.title);
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows({
      query: "Home State = NY",
    });

    rows.forEach((row) => {
      printStudent(row);
    });

    res.status(200).json({
      success: true,
    });
  } catch (e) {
    next(e);
  }
};
