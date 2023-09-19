const express = require("express");
const User = require("../models/User");
const router = express.Router();
const multer = require('multer');
const csv = require('csvtojson');
const Classes = require("../models/Class");
const moment = require("moment");
const Schedule = require("../models/Schedule");
 


const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});
const upload = multer({ storage: fileStorage });

async function getRandomGeneratedNumber() {
  const number = Math.floor(Math.random() * 1000);
  try {
    const exists = await Schedule.findOne({ registrationID: number });
    return exists ? await getRandomGeneratedNumber() : number;
  } catch (e) {
    console.error(e);
  }
}


router.post("/addRegistrations", upload.single('file'), async function (req, res) {
  try {
    const jsonArray = await csv().fromFile(req.file.path);

    for (let i = 0; i < jsonArray.length; i++) {
      let item = jsonArray[i];
      try {
        let studentData = await User.findOne({ 'user_id_number': +item.studentID, userType: 'student' });
        let classData = await Classes.findOne({ 'class_id_number': +item.classID })
        let instructorData = await User.findOne({ 'user_id_number': +item.instructorID, userType: 'instructor' })

        const sheduleData = await Schedule.findOne({ 'registrationID': Number(item?.registrationID) }).populate('studentID').populate('instructorID').populate('classID')
       
        let newSchedule = new Schedule();
        let exist_schedlue_checking ;

        if (item.action === 'new' || item.action === 'update') {
          const startClass = moment(item.dateTimeStartOfClass, 'DD-MM-YYYY HH:mm').format('YYYY-MM-DD[T]HH:mm:ss')
          const endClass = moment(new Date(startClass)).add(process.env.DURATION_OF_CLASS, 'minutes').format('YYYY-MM-DD[T]HH:mm:ss')
          const newStartDate = moment(new Date(startClass)).add(4, 'hours')
          const newEndDate=  moment(new Date(endClass)).add(4, 'hours')

          console.log(new Date(newStartDate).toISOString(),new Date(newEndDate).toISOString())
       

          if (studentData === null) {
            const newUser = new User();
            newUser.fullName = `Student_${item.studentID}`;
            newUser.user_id_number = item.studentID;
            newUser.userType = 'student';
            studentData = await newUser.save();
          }
          if (classData === null) {
            const newClass = new Classes();
            newClass.class_name = `Class_${item.classID}`;
            newClass.class_id_number = item.classID;
            newClass.class_type = 'type_1';
            classData = await newClass.save();
          }

          if (instructorData === null) {
            const newInstructor = new User();
            newInstructor.fullName = `Instructor_${item.instructorID}`;
            newInstructor.user_id_number = item.instructorID;
            newInstructor.userType = 'instructor';
            instructorData = await newInstructor.save();

          }

          exist_schedlue_checking =   await Schedule.findOne({

            $or:[{
                studentID:studentData?._id
              },
              {
               instructorID:instructorData?._id
            }],
            $or:[
              {dateTimeStartOfClass:
                {$gte:new Date(newStartDate).toISOString(),
                 $lte:new Date(newEndDate).toISOString()}
              },
              {dateTimeEndOfClass:
                {$gte:new Date(newStartDate).toISOString(),
                  $lte:new Date(newEndDate).toISOString()}
              }
            ]
           })

            const today = new Date(newStartDate);
            today.setHours(0, 0, 0, 0);
            const endOfDay = new Date(newStartDate);
            endOfDay.setHours(23, 59, 59, 999);

             const  student_per_day =  await Schedule.countDocuments({
                studentID:studentData?._id,
                dateTimeStartOfClass:
                  {$gte:new Date(today).toISOString(),
                   $lte:new Date(endOfDay).toISOString()}
              })

              const instructor_per_day =  await Schedule.countDocuments({
                instructorID:instructorData?._id,
                dateTimeStartOfClass:
                  {$gte:new Date(today).toISOString(),
                   $lte:new Date(endOfDay).toISOString()}
              })

              const class_per_day =  await Schedule.countDocuments({
                classID:classData?._id,
                dateTimeStartOfClass:
                  {$gte:new Date(today).toISOString(),
                   $lte:new Date(endOfDay).toISOString()}
              })

              console.log("student_per_day===",student_per_day,instructor_per_day,class_per_day)

              if(student_per_day >= process.env.STUDENT_MAXIMUM_CLASS_PER_DAY)
                  console.log(`a student cannot schedule more than ${process.env.STUDENT_MAXIMUM_CLASS_PER_DAY} classes in a day`)

              if(instructor_per_day >= process.env.INSTRUCTOR_MAXIMUM_CLASS_PER_DAY)
                  console.log(`a Instructor cannot schedule more than ${process.env.INSTRUCTOR_MAXIMUM_CLASS_PER_DAY} classes in a day`)

              if(class_per_day >= process.env.MAXIMUM_NUMBER_CLASS_TYPE_PER_DAY)
                  console.log(`a maximum number of classes per class-type that can be scheduled in a day is ${process.env.MAXIMUM_NUMBER_CLASS_TYPE_PER_DAY}`)

             console.log("Studnt/instructor already have same schedule for this time period.....",exist_schedlue_checking)
        
         }


        if (item.action === 'new' && !exist_schedlue_checking ) {

          const startClass = moment(item.dateTimeStartOfClass, 'DD-MM-YYYY HH:mm').format('YYYY-MM-DD[T]HH:mm:ss')
          const endClass = moment(new Date(startClass)).add(process.env.DURATION_OF_CLASS, 'minutes').format('YYYY-MM-DD[T]HH:mm:ss')
          newSchedule.studentID = studentData._id
          newSchedule.classID = classData._id
          newSchedule.instructorID = instructorData._id
          newSchedule.dateTimeStartOfClass = moment(new Date(startClass)).add(4, 'hours')
          newSchedule.dateTimeEndOfClass = moment(new Date(endClass)).add(4, 'hours')
          newSchedule.registrationID = await getRandomGeneratedNumber()
          //console.log("newSchedule",newSchedule)
          await newSchedule.save()
        }

        else if (item.action === 'update') {
          const startClass = moment(item.dateTimeStartOfClass, 'DD-MM-YYYY HH:mm').format('YYYY-MM-DD[T]HH:mm:ss')
          const endClass = moment(new Date(startClass)).add(45, 'minutes').format('YYYY-MM-DD[T]HH:mm:ss')

          if (sheduleData === null)
            console.log('no shedules founded...')
          else if(!exist_schedlue_checking) {
              const updatedData = await Schedule.findOneAndUpdate({
                registrationID: sheduleData?.registrationID
              },
                {
                  studentID: studentData._id,
                  classID: classData._id,
                  instructorID: instructorData._id,
                  dateTimeStartOfClass: moment(new Date(startClass)).add(4, 'hours'),
                  dateTimeEndOfClass: moment(new Date(endClass)).add(4, 'hours')
                })
              console.log("updatedData", updatedData)
            

          }

        }
        else if (item.action === 'delete') {
          if (sheduleData === null)
            console.log('no shedules founded for delete...')
          else {
            await Schedule.findOneAndDelete({ registrationID: sheduleData?.registrationID})
          }

        }


      }
      catch (err) {
        console.log(err)
      }
    };


    res.send({ auth: true, data: jsonArray });

  } catch (error) {
    res.status(500).json(error);
  }
});


module.exports = router;