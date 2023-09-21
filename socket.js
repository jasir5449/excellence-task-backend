const express = require('express')
const {Server} = require('socket.io')
const { createServer } = require('http')
const app = express()
const server = createServer(app)
console.log( process.env.SOCKET_URL)
const io = new Server(server,{
    cors: {
        origin : process.env.SOCKET_URL
    }
})

module.exports = {
    app,
    server,
    io
}