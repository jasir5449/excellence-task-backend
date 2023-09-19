const express = require("express");
const User = require("../models/User");
const router = express.Router();

router.post("/new", async function (req, res) {
  try {
    const newUser = new User(req.body);
    //newUser.user_id_number = await User.find().count()+1,
    newUser.user_id_number = new Date().getTime();
    await newUser.save();

    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/update/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(updatedUser);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.delete('/delete', async (req, res) => {
  try {
    const deletedUser = await User.deleteMany({});

    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.get('/listUsers', async (req, res) => {
  try {
    const users = await User.find();

    if (!users) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'All Users',data:users });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;