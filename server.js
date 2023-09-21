require('dotenv').config();
const express = require('express')
const { app, server, io } = require('./socket')
const dbConnect = require('./dbConnect')
var bodyParser = require('body-parser')
const cors = require('cors')
app.use(express.json({limit: '50mb'}))
const path = require('path')
const usersRoute = require('./routes/usersRoute')
const schedulesRoute = require('./routes/schedulesRoute')
const classesRoute = require('./routes/classesRoute')
const settingsRoute = require('./routes/settingsRoute')


app.use(express.static('documents'))
app.use(cors('*'))
app.use(bodyParser.urlencoded({extended: true}));

 app.use('/api/users/' , usersRoute)
 app.use('/api/schedules/' , schedulesRoute) 
 app.use('/api/classes/' , classesRoute) 
 app.use('/api/settings/' , settingsRoute) 

app.get('/' , (req, res)=>{
    res.send('<<<<..... Backend API for class schedules is working ......>>>>')
})

io.on('connection',() => {
    console.log("A connection successfull")
})

const port =process.env.PORT || 4000

server.listen(port, () => console.log(`Node JS Server started at port ${port}!`))
