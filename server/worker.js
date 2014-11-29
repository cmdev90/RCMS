var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http)
    , cluster = require('cluster')
    , numCPUs = require('os').cpus().length
    , hat = require('hat')

var nodeId  = hat();

console.log('created worker ' + nodeId);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    console.log("client connected to " + nodeId)
  socket.on('chat message', function(msg){
    console.log("Messaging from " + nodeId)
    io.emit('chat message', msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
