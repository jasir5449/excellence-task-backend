const express = require("express");
const User = require("../models/User");
const router = express.Router();
const multer = require('multer');
const csv = require('csvtojson');
const Classes = require("../models/Class");
const moment = require("moment");
const Schedule = require("../models/Schedule");
const Settings = require("../models/Settings");
 

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
    const appConfig = await Settings.findOne()

    const student_max_class_day     =  appConfig?.student_max_class_day || process.env.STUDENT_MAXIMUM_CLASS_PER_DAY
    const instructor_max_class_day  =  appConfig?.instructor_max_class_day || process.env.INSTRUCTOR_MAXIMUM_CLASS_PER_DAY
    const classtype_max_class_day   =  appConfig?.classtype_max_class_day || process.env.MAXIMUM_NUMBER_CLASS_TYPE_PER_DAY
    const class_duration            =  appConfig?.class_duration || process.env.DURATION_OF_CLASS
    
    const jsonArray = await csv().fromFile(req.file.path);

    let resultarray =[];

    for (let i = 0; i < jsonArray.length; i++) {

      let item = jsonArray[i];
      resultarray.push(item);

      try {
        let studentData = await User.findOne({ 'user_id_number': +item.studentID, userType: 'student' });
        let classData = await Classes.findOne({ 'class_id_number': +item.classID })
        let instructorData = await User.findOne({ 'user_id_number': +item.instructorID, userType: 'instructor' })

        const sheduleData = await Schedule.findOne({ 'registrationID': Number(item?.registrationID) }).populate('studentID').populate('instructorID').populate('classID')
          if(!sheduleData  && (item.action === 'update' || item.action === 'delete' )){
             resultarray[i].status = {code:1000, message:'Registration ID not exists'}
             continue; 
          }

        let newSchedule = new Schedule();
        let exist_schedlue_checking ;

        if (item.action === 'new' || item.action === 'update') {
          const startClass = moment(item.dateTimeStartOfClass, 'DD-MM-YYYY HH:mm').format('YYYY-MM-DD[T]HH:mm:ss')
          const endClass = moment(new Date(startClass)).add(class_duration, 'minutes').format('YYYY-MM-DD[T]HH:mm:ss')
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

            $and:[{
                $or:[{
                  studentID:studentData?._id
                },
                {
                instructorID:instructorData?._id
                }],
             },
             {
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
             }
          ]})

            if(exist_schedlue_checking){
              let msg ='';
              if(exist_schedlue_checking.instructorID === item.instructorID && exist_schedlue_checking.studentID === item.studentID ){
                 msg = `Student & Instructor Already Scheduled class this time slot`
              }
              else if(exist_schedlue_checking.instructorID === item.instructorID){
                 msg = `Instructor Already Scheduled class this time slot`
              }
              else{
                msg = `Student Already Scheduled class this time slot`
              }
              resultarray[i].status = {code:1001, message:msg};
              continue; 

            }
              

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

              if(student_per_day >= student_max_class_day){
                resultarray[i].status = {code:1002, message:`a student cannot schedule more than ${student_max_class_day} classes in a day`}
                continue; 
              }
                
              if(instructor_per_day >= instructor_max_class_day){
                resultarray[i].status ={code:1003, message:`a Instructor cannot schedule more than ${instructor_max_class_day} classes in a day`}
                continue; 
              }
         
              if(class_per_day >= classtype_max_class_day){
                resultarray[i].status = {code:1004, message:`a maximum number of classes per class-type that can be scheduled in a day is ${classtype_max_class_day}`}
                continue; 
              }
            
        
         }


        if (item.action === 'new'  ) {
          const startClass = moment(item.dateTimeStartOfClass, 'DD-MM-YYYY HH:mm').format('YYYY-MM-DD[T]HH:mm:ss')
          const endClass = moment(new Date(startClass)).add(class_duration, 'minutes').format('YYYY-MM-DD[T]HH:mm:ss')
          newSchedule.studentID = studentData._id
          newSchedule.classID = classData._id
          newSchedule.instructorID = instructorData._id
          newSchedule.dateTimeStartOfClass = moment(new Date(startClass)).add(4, 'hours')
          newSchedule.dateTimeEndOfClass = moment(new Date(endClass)).add(4, 'hours')
          newSchedule.registrationID = await getRandomGeneratedNumber()
          //console.log("newSchedule",newSchedule)
          await newSchedule.save();
          resultarray[i].status = {code:1005, message:'New Schedule Added'}
        }

        else if (item.action === 'update') {
          const startClass = moment(item.dateTimeStartOfClass, 'DD-MM-YYYY HH:mm').format('YYYY-MM-DD[T]HH:mm:ss')
          const endClass = moment(new Date(startClass)).add(45, 'minutes').format('YYYY-MM-DD[T]HH:mm:ss')

            await Schedule.findOneAndUpdate({
                registrationID: sheduleData?.registrationID
              },
                {
                  studentID: studentData._id,
                  classID: classData._id,
                  instructorID: instructorData._id,
                  dateTimeStartOfClass: moment(new Date(startClass)).add(4, 'hours'),
                  dateTimeEndOfClass: moment(new Date(endClass)).add(4, 'hours')
                })
             
                resultarray[i].status = {code:1006, message:'Schedule Updated Success'}
        }
        else if (item.action === 'delete') {
            await Schedule.findOneAndDelete({ registrationID: sheduleData?.registrationID});
            resultarray[i].status = {code:1007, message:'Schedule Deleted Success'}
        }


      }
      catch (err) {
        console.log(err)
      }
    };

    res.json({ msg: 'success', data: resultarray });

  } catch (error) {
    res.status(500).json(error);
  }
});


router.post("/get-all-schedules", async (req, res) => {
  const { frequency, selectedRange , type,searchValue } = req.body;
  console.log("searchValue==",searchValue)
  try {
    const schedules = await Schedule.find({
     

      ...(
        frequency === '0' ? '' :
        (frequency !== "custom"
        ? {
            dateTimeStartOfClass: {
              $gt: moment().subtract(Number(req.body.frequency), "d").toDate(),
            },
          }
        : {
            dateTimeStartOfClass: {
              $gte:moment( selectedRange[0]).startOf('day'),
              $lte:moment( selectedRange[1]).endOf('day'),
            },
          }
          
          )
        ),
      ...(type!=='all' && {classID:type}),
    }).populate('studentID').populate('instructorID').populate('classID');

    console.log("schedules",schedules)

    res.send(schedules);
  } catch (error) {
    res.status(500).json(error);
  }
});


router.get("/get-graph-data", async (req, res) => {
  try {
    const schedules =  await Schedule.aggregate([
      {
        $group : {
          _id :{ $dateToString: { format: "%Y-%m-%d", date: "$dateTimeStartOfClass"} },
          count: { $sum: 1 }
       }
      },
      {
        $sort: { '_id': 1 },
      },
    ]);
    res.send({data:schedules});
  } catch (error) {
    res.status(500).json(error);
  }
});


module.exports = router;