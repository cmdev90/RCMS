var cluster = require('cluster')

if (cluster.isWorker) {
  var net = require('net');
  var server = net.createServer(function(socket) {
    // connections never end
  });

  server.listen(8000);

  process.on('message', function(msg) {
    if(msg === 'shutdown') {
      // initiate graceful close of any connections to server
    }
  });

  console.log("Hello from worker process " + cluster.worker.id)
}