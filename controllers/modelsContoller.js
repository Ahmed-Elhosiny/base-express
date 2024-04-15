const bcrypt = require('bcrypt');
const crypto = require('crypto');
const otp = require('./../utils/otp');

exports.encryptPassword = async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
  }
  next();
};
exports.passwordChangedAt = function (next) {
  if (!this.isNew && this.isModified('password')) {
    this.passwordChangedAt = Date.now() - 1000;
  }
  next();
};
exports.getOnlyActive = function (next) {
  this.find({ active: { $ne: false } });
  next();
};
exports.correctPassword = async (inputPassword, userPassword) => {
  return await bcrypt.compare(inputPassword, userPassword);
};
exports.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};
exports.createPasswordResetOTP = function () {
  const resetOTP = otp();
  this.passwordResetOTP = crypto.createHash('sha256').update(resetOTP).digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Expires in 10 minutes
  return resetOTP;
};
