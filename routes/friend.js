const express = require('express');
const {
  getSuggestions,
  follow,
  getFollowersAndFollowings,
  searchFriends,
} = require('../controllers/friends/friends');

const router = express.Router();

router.get('/suggestions', getSuggestions);
router.post('/follow', follow);
router.get('/followers-following', getFollowersAndFollowings);
router.get('/search', searchFriends);

module.exports = router;
