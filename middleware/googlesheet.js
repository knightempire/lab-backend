require('dotenv').config();
const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  credentials: {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: process.env.GOOGLE_AUTH_URI,
    token_uri: process.env.GOOGLE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL,
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function getSheetIdByName(sheets, spreadsheetId, sheetName) {
  const response = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = response.data.sheets.find(s => s.properties.title === sheetName);
  if (!sheet) throw new Error(`Sheet with name "${sheetName}" not found.`);
  return sheet.properties.sheetId;
}

async function cleanEmptyRows(sheets, spreadsheetId, sheetName, headerRowCount = 1) {
  const readRange = `${sheetName}!A2:Z`;
  const getResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: readRange,
  });

  const rows = getResponse.data.values || [];

  const emptyRowIndexes = [];
  rows.forEach((row, i) => {
    const isEmpty = row.every(cell => cell === '' || cell === undefined);
    if (isEmpty) emptyRowIndexes.push(i);
  });

  if (emptyRowIndexes.length > 0) {
    const sheetId = await getSheetIdByName(sheets, spreadsheetId, sheetName);

    const requests = emptyRowIndexes
      .sort((a, b) => b - a)
      .map(i => ({
        deleteDimension: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: i + headerRowCount,
            endIndex: i + headerRowCount + 1,
          },
        },
      }));

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests },
    });
  }
}

/**
 * Append a single row of values to the Google Sheet (after cleaning empty rows).
 * @param {Array} rowValues Array of cell values to append, e.g. ['Alice', 37]
 */

async function appendRow(rowValues) {
  if (!Array.isArray(rowValues)) {
    throw new Error('rowValues must be an array');
  }

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const spreadsheetId = process.env.SPREADSHEET_ID;
  const fullRange = process.env.SHEET_RANGE || 'Sheet1!A2';
  const [sheetName] = fullRange.split('!');

  // Clean empty rows below header
  await cleanEmptyRows(sheets, spreadsheetId, sheetName);

  // Append the new row
  const resource = { values: [rowValues] };
  const appendResult = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A2`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    resource,
  });

  return appendResult.data;
}

module.exports = { appendRow };
