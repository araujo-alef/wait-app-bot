const admin = require('firebase-admin');

module.exports = admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.TYPE,
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'), // <-- isso é crucial
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
  }),
});

const db = admin.firestore();

module.exports = { db };