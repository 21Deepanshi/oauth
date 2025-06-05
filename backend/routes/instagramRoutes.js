const express = require('express');
const { connectInstagram, instagramCallback } = require('../controllers/instagramCOntroller');

const router = express.Router();

router.get('/instagram/connect', connectInstagram);
router.get('/instagram/callback', instagramCallback);

module.exports = router;
