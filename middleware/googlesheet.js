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

async function getSheetIdbyReqID(sheets, spreadsheetId, sheetName) {
  const response = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = response.data.sheets.find(s => s.properties.title === sheetName);
  if (!sheet) throw new Error(`Sheet with name "${sheetName}" not found.`);
  return sheet.properties.sheetId;
}

async function cleanEmptyRows(sheets, spreadsheetId, sheetName, headerRowCount = 1) {
  const readRange = `${sheetName}!A2:D`;
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
    const sheetId = await getSheetIdbyReqID(sheets, spreadsheetId, sheetName);
    const requests = emptyRowIndexes.sort((a, b) => b - a).map(i => ({
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

async function appendRow(rowValues) {
  if (!Array.isArray(rowValues) || rowValues.length !== 4) {
    throw new Error('appendRow expects an array with exactly 4 values: [requestId, scheduledCollectionDate, status, returnDate]');
  }

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const spreadsheetId = process.env.SPREADSHEET_ID;
  const fullRange = process.env.SHEET_RANGE || 'Sheet1!A2:D';
  const [sheetName] = fullRange.split('!');

  await cleanEmptyRows(sheets, spreadsheetId, sheetName);

  const resource = { values: [rowValues] };
  const appendResult = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A2:D`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    resource,
  });

  return appendResult.data;
}

async function deleteRowbyReqID(requestId) {
  if (typeof requestId !== 'string') {
    throw new Error('requestId must be a string');
  }

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const spreadsheetId = process.env.SPREADSHEET_ID;
  const fullRange = process.env.SHEET_RANGE || 'Sheet1!A2:D';
  const [sheetName] = fullRange.split('!');

  const getResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: fullRange,
  });

  const rows = getResponse.data.values || [];
  let targetRowIndex = -1;

  for (let i = 0; i < rows.length; i++) {
    if ((rows[i][0] || '').trim() === requestId.trim()) {
      targetRowIndex = i;
      break;
    }
  }

  if (targetRowIndex === -1) {
    throw new Error(`No row found with requestId "${requestId}".`);
  }

  const sheetId = await getSheetIdbyReqID(sheets, spreadsheetId, sheetName);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: targetRowIndex + 1,
              endIndex: targetRowIndex + 2,
            },
          },
        },
      ],
    },
  });
}

async function updateRowbyReqID(requestId, newValues) {
  if (typeof requestId !== 'string') throw new Error('requestId must be a string');
  if (!Array.isArray(newValues) || newValues.length !== 4) {
    throw new Error('newValues must be an array of 4 items: [requestId, scheduledCollectionDate, status, returnDate]');
  }

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const spreadsheetId = process.env.SPREADSHEET_ID;
  const fullRange = process.env.SHEET_RANGE || 'Sheet1!A2:D';
  const [sheetName] = fullRange.split('!');

  const getResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: fullRange,
  });

  const rows = getResponse.data.values || [];
  let targetRowIndex = -1;

  for (let i = 0; i < rows.length; i++) {
    if ((rows[i][0] || '').trim() === requestId.trim()) {
      targetRowIndex = i;
      break;
    }
  }

  if (targetRowIndex === -1) {
    throw new Error(`No row found with requestId "${requestId}".`);
  }

  const rangeToUpdate = `${sheetName}!A${targetRowIndex + 2}:D${targetRowIndex + 2}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: rangeToUpdate,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [newValues],
    },
  });
}


async function isRequestIdExists(requestId) {
  if (typeof requestId !== 'string') {
    throw new Error('requestId must be a string');
  }

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const spreadsheetId = process.env.SPREADSHEET_ID;
  const fullRange = process.env.SHEET_RANGE || 'Sheet1!A2:D';
  const [sheetName] = fullRange.split('!');

  const getResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: fullRange,
  });

  const rows = getResponse.data.values || [];

  for (const row of rows) {
    if ((row[0] || '').trim() === requestId.trim()) {
      return true; // Found matching requestId
    }
  }

  return false; // Not found
}

module.exports = {
  appendRow,
  deleteRowbyReqID,
  updateRowbyReqID,
  isRequestIdExists
};
