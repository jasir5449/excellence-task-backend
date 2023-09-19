const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const scheduleSchema = new mongoose.Schema({

    registrationID:{
            type: Number,
            unique: true,
            required: true,
    },
    studentID: {
            type: Schema.Types.ObjectId,
            ref: 'Users'
    },
    instructorID: {
            type: Schema.Types.ObjectId,
            ref: 'Users'
    },
    classID: {
            type: Schema.Types.ObjectId,
            ref: 'Classes'
    },
    dateTimeStartOfClass: {
        type: Date,
        required: true,
    },
    dateTimeEndOfClass: {
        type: Date,
        required: true,
    },
    action:{
        type: String,
        enum: ['new', 'update','delete']
    }

}, {
  timestamps: true,
});

const Schedulemodel = mongoose.model('Schedules', scheduleSchema);

module.exports = Schedulemodel;
