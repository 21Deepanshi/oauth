// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

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
  res.redirect(`http://localhost:3000/oauth-success?code=${code}`);
});

app.listen(5000, () => console.log('OAuth server on http://localhost:5000'));


https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=595748610218066&redirect_uri=https://getchime.app/api/instagram/callback&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights
