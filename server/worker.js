var app = require('express')()
    , http = require('http').Server(app)
    , io = require('socket.io')(http)
    , cluster = require('cluster')
    , numCPUs = require('os').cpus().length
    , hat = require('hat')


var datastore = require('./datastore.js')('asdfasdf')

// datastore.makeOrUpdateUser({id: 'u03f0b894', password: 'qwerty'}, function(err, result){
//     console.log(err)
//     console.log(result)
// })

// datastore.findUser('u03f0b894', 'qwerty', function(err, result){
//     console.log(err)
//     console.log(result)
// })


// datastore.updateStatistics({action: 'delivery', type: 'batch', count: 10}, function(err, result){
//     console.log(err)
//     console.log(result)
// })

datastore.getUsageStatistics(function(err, result){
    console.log(err)
    console.log(result)
})
// var nodeId  = hat()


// app.get('/', function(req, res){
//     res.sendFile(__dirname + '/index.html')
// })

// // Counts the number of clients on a given connection and
// // retuns this value.
// var userCount = function (connections) {
//     var count = 0

//     for(c in connections)
//         count++

//     return count
// }

// io.on('connection', function(socket){
//     console.log("client connected to " + nodeId)

//     socket.on('chat message', function(msg){
//         console.log("Messaging from " + nodeId)
//         console.log(userCount(io.sockets.connected))
//         io.emit('chat message', msg)
//     })

// })

// http.listen(process.env.port, function(){
//     console.log('listening on *:' + process.env.port)
// })
