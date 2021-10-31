const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {isEmail} = require('validator');

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is mandatory'],
      minlength: [3, 'Username must be 3 or more characters'],
      maxlength: [19, 'Username must be under 20 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: [true, 'email already exist'],
      lowercase: true,
      validate: [isEmail, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be 6 or more characters'],
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);
// TODO: change the schema and file name etc w.r.t Employee
module.exports = mongoose.model('Employee', UserSchema );
