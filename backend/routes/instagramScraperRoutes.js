const express = require('express');
const { instagramApifyOnly } = require('../controller/instagramScraperController');
const router = express.Router();

router.get('/apify', instagramApifyOnly);

module.exports = router;
