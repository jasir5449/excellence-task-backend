const express = require("express");
const Settings = require("../models/Settings");
const router = express.Router();


router.post("/add-config-data", async function (req, res) {
  try {
    console.log(req.body)
    const newlSettings = new Settings(req.body);
    await newlSettings.save();

    res.status(201).json(newlSettings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/update-config-data', async (req, res) => {
  try {
   
    const updatedClass =  await Settings.findOneAndUpdate({_id : req.body.configID} , req.body.payload,{
        new: true,
      })

    if (!updatedClass) {
      return res.status(200).json({ message: 'not_found',data:'No Data found' });
    }
    res.json({message: 'success',data:updatedClass });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



router.get('/get-config-data', async (req, res) => {
    try {
      const settings = await Settings.findOne();
  
      if (!settings) {
        return res.status(200).json({ message: 'not_found',data:'No Data found' });
      }
      res.json({ message: 'success',data:settings });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

module.exports = router;