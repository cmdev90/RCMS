var net = require('net')
, hat = require('hat')

// create a random process ID string.
var processID = hat()
    , clientPool = [] // keep a list of all the clients connected to this Message Service instance.


var server = net.createServer(function(socket) { //'connection' listener
    // each time a
    console.log('Client connected to Message service %s', processID)

    socket.on('end', function() {
        console.log('Client disconnected from %s', processID)
    })

    socket.on('data', function(chunk) {
        console.log(chunk.toString())
    })

    socket.setKeepAlive(true, 1000)
    socket.write(processID + ' hello\r\n')
    socket.pipe(socket)
})

server.listen(1337, function() { //'listening' listener
    console.log('Message service %s bounded', processID)
})