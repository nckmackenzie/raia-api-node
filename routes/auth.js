const express = require('express');
const {
  signUp,
  signIn,
  changepassword,
  getUser,
  logout,
} = require('../controllers/auth');

const router = express.Router();

router.post('/sign-up', signUp);
router.post('/sign-in', signIn);
router.patch('/change-password', changepassword);
router.get('/me', getUser);
router.post('/logout', logout);
// router.patch('/change-password', changepasswordDummy);

module.exports = router;
