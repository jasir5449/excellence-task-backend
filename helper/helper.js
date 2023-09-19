const Schedule = require("../models/Schedule")

 async function getRandomGeneratedNumber() {
    const number = Math.floor(Math.random() * 1000);
    try {
      const exists = await Schedule.findOne({registrationID: number});
      console.log("number",number)
      return exists ? await getRandomGeneratedNumber() : number;
    } catch(e) {
      // if you ignore the error, at least log it
      console.error(e);
    }
  }
  module.exports = getRandomGeneratedNumber; 