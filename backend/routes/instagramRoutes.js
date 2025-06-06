const express = require('express');
// const { connectInstagram, instagramCallback } = require('../controller/instagramCOntroller');
const { connectInstagram, instagramCallback } = require('../controller/instagramScraperController');

const router = express.Router();

router.get('/connect', connectInstagram);
router.get('/callback', instagramCallback);

module.exports = router;
