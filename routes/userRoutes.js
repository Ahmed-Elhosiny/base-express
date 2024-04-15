const express = require('express');
const userController = require('./../controllers/userController');
const auth = require('./../controllers/auth');

const router = express.Router({
  caseSensitive: false,
  mergeParams: false,
  strict: false,
});

router.get('/me', auth.protect, userController.getMe, userController.getUser);
router.patch('/updateMe', auth.protect, userController.updateMe);
router.delete('/deleteMe', auth.protect, userController.deleteMe);

// //Only admins can use the next middlewares
// router.use(authController.restrictTo('admin'));

router.route('/').get(userController.getAllUsers).post(userController.createUser);

router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);

module.exports = router;
