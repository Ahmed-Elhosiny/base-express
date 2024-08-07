const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsyn = require('../utils/catchAsync');
const filterObj = require('./../utils/filterObj');
const factory = require('./handlerFactory');

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsyn(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm)
    return next(new AppError('This route is not for password updated, Please use /updateMyPassword', 400));

  // 2) Filterd out unwanted fields name that are not allowd to be updated
  const filterdBody = filterObj(req.body, 'password', 'passwordConfirm');
  if (req.file) filterdBody.photo = req.file.filename;

  // 3) Update user document
  const updatedUser = await User.findOneAndUpdate({ _id: req.user.id }, filterdBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsyn(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead',
  });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
