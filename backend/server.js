// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const instagramRoute = require('./routes/instagramRoutes');
const app = express();
app.use(cors());

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;

app.get('/auth/google', (req, res) => {
  const authUrl =
    'https://accounts.google.com/o/oauth2/v2/auth?' +
    new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'profile email'
    }).toString();
  res.redirect(authUrl);
});

app.get('/auth/google/callback', (req, res) => {
  const code = req.query.code;
  res.redirect(`https://oauth-1-l0jt.onrender.com/oauth-success?code=${code}`);
});
app.use('/api/instagram', instagramRoutes);;
app.listen(5000, () => console.log('OAuth server on http://localhost:5000'));

