const { google } = require('googleapis');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { firstName, lastName, email, organization, role } = req.body;

  if (!firstName || !lastName || !email || !organization || !role) {
    return res.status(400).json({ ok: false, error: 'Missing fields' });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const timestamp = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Feuille1!A:F',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[timestamp, firstName, lastName, email, organization, role]],
      },
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Google Sheets error:', err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
}
