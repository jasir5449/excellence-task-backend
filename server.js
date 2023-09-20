const express = require('express')
require('dotenv').config();
const dbConnect = require('./dbConnect')
var bodyParser = require('body-parser')
const app = express()
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
    res.send('check api for expense calculator backend')
})

const port =process.env.PORT || 4000

app.listen(port, () => console.log(`Node JS Server started at port ${port}!`))
