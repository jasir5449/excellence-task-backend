const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  class_name: {
    type: String,
    required: true,
  },
  class_id_number:{
    type: Number,
    unique: true,
    required: true,
  },
  class_type: {
    type: String,
    enum: ['type_1', 'type_2','type_3']
  }
}, {
  timestamps: true,
});

const Classmodel = mongoose.model('Classes', classSchema);

module.exports = Classmodel;
