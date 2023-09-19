const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  user_id_number:{
    type: Number,
    unique: true,
    required: true,
  },
  userType: {
    type: String,
    enum: ['student', 'instructor']
  },
}, {
  timestamps: true,
});

const usermodel = mongoose.model('Users', userSchema);

module.exports = usermodel;
