const express = require('express');
const { postFeed, getFeeds } = require('../controllers/feeds/feeds');

const router = express.Router();

router.get('/', getFeeds);
router.post('/', postFeed);

module.exports = router;
