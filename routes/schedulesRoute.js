const express = require("express");
const User = require("../models/User");
const router = express.Router();
const multer = require('multer');
const csv=require('csvtojson');
const Class = require("../models/Class");
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
    const exists = await Schedule.findOne({registrationID: number});
    return exists ? await getRandomGeneratedNumber() : number;
  } catch(e) {
    // if you ignore the error, at least log it
    console.error(e);
  }
}

router.post("/addRegistrations",upload.single('file'), async function (req, res) {
  try {
    const jsonArray=await csv().fromFile(req.file.path);
  
    const dataset = jsonArray.map(async(item)=>{
          const studentData = await User.find({'user_id_number':item.studentID,userType:'student'});
          const classData = await Class.find({'class_id_number':item.classID});
          const instructorData = await User.find({'user_id_number':item.instructorID,userType:'instructor'})

          const sheduleData = await Schedule.find({'registrationID':Number(item?.registrationID)}).populate('studentID').populate('instructorID').populate('classID')

          let newSchedule = new Schedule();

         if(item.action === 'new'){
           try{
                  if (studentData?.length === 0) {
                    const newUser = new User();
                    newUser.fullName = `Student_${item.studentID}`;
                    newUser.user_id_number = item.studentID;
                    newUser.userType = 'student';
                    const userInsert = await newUser.save();
                    newSchedule.studentID = userInsert._id
                  }
                  else{
                    newSchedule.studentID = studentData[0]._id
                  }

                  if (classData.length === 0) {
                    const newClass = new Class();
                    newClass.class_name = `Class_${item.classID}`;
                    newClass.class_id_number = item.classID;
                    newClass.class_type = 'type_1';
                    const classInsert = await newClass.save();
                    newSchedule.classID = classInsert._id
                  }
                  else{
                    newSchedule.classID = classData[0]._id
                  }

                  if (instructorData.length === 0) {
                    const newInstructor = new User();
                    newInstructor.fullName = `Instructor_${item.instructorID}`;
                    newInstructor.user_id_number = item.instructorID;
                    newInstructor.userType = 'instructor';
                    const insInsert = await newInstructor.save();
                    newSchedule.instructorID = insInsert._id
                  }
                  else{
                    newSchedule.instructorID = instructorData[0]._id
                  }
                
                   const startClass= moment(item.dateTimeStartOfClass,'DD-MM-YYYY HH:mm').format('YYYY-MM-DD[T]HH:mm:ss')
                   const endClass = moment( new Date(startClass)).add(45, 'minutes').format('YYYY-MM-DD[T]HH:mm:ss')
                 //  console.log(startClass,endClass,)
                   newSchedule.dateTimeStartOfClass =  moment( new Date(startClass)).add(4, 'hours')
                   newSchedule.dateTimeEndOfClass =  moment( new Date(endClass)).add(4, 'hours')
                   newSchedule.registrationID =  await getRandomGeneratedNumber()
                   //console.log("newSchedule",newSchedule)
                  // await newSchedule.save();

          }
          catch(err){
            console.log(err)
          } 
         }
         else if(item.action ==='update'){
          console.log('updatedata===',item,sheduleData)
         }
         else if(item.action === 'delete'){
         // console.log('deletedata',item)
         }
     });
 

    res.send({auth:true,data:jsonArray});
    
  } catch (error) {
    res.status(500).json(error);
  }
});


module.exports = router;