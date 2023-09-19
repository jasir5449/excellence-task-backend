const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://jasir5449:woPJ12rhzwaVM8XZ@cluster0.4b5wc.mongodb.net/excellence-task' , {useNewUrlParser : true , useUnifiedTopology : true})

const connection = mongoose.connection

connection.on('error', err => console.log(err))

connection.on('connected' , () => console.log('Mongo DB Connection Successfull'))