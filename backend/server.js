// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const instagramRoute = require('./routes/instagramRoutes');
const app = express();
app.use(cors());

app.use('/api/instagram', instagramRoute);;
app.listen(5000, () => console.log('OAuth server on http://localhost:5000'));

