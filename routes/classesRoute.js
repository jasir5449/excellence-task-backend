const express = require("express");
const Class = require("../models/Class");
const User = require("../models/User");
const router = express.Router();

router.post("/new", async function (req, res) {
  try {
    const newlClass = new Class(req.body);
    newlClass.class_id_number = new Date().getTime();
    await newlClass.save();

    res.status(201).json(newlClass);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/update/:id', async (req, res) => {
  try {
    const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updatedClass) {
      return res.status(404).json({ error: 'Ccass not found' });
    }
    res.json(updatedClass);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.delete('/delete', async (req, res) => {
  try {
    const deletedClass = await Class.deleteMany({});

    if (!deletedClass) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/fetch-classess-instructor', async (req, res) => {
    try {
      const classes = await Class.find();
      const instructors = await User.find({userType:'instructor'})
  
      if (!classes) {
        return res.status(404).json({ error: 'Classes not found' });
      }
      if (!instructors) {
        return res.status(404).json({ error: 'Instructors not found' });
      }
  
      res.json({ message: 'All Classes',data:{classes:classes,instructors:instructors} });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

module.exports = router;