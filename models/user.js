const mongoose = require('mongoose'),
      passportLocalMongoose = require('passport-local-mongoose')

const UserSchema = new mongoose.Schema({
  username: { type: String, uniqu: true, require: true },
  password: String,
  avatar: String,
  firstName: String,
  lastName : String,
  email:  { type: String, uniqu: true, require: true },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isAdmin: { type: Boolean, default: false }
})

UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', UserSchema)