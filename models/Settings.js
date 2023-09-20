const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  student_max_class_day: {
    type: Number,
  },
  instructor_max_class_day:{
    type: Number,
  },
  classtype_max_class_day:{
    type: Number,
  },
  class_duration:{
    type: Number,
  },
}, {
  timestamps: true,
});

const Classmodel = mongoose.model('Settings', configSchema);

module.exports = Classmodel;
