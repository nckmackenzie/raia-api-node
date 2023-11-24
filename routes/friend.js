const express = require('express');
const { getSuggestions } = require('../controllers/friends/friends');

const router = express.Router();

router.get('/suggestions', getSuggestions);

module.exports = router;
