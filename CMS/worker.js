
var port = process.argv[2]
var auth = process.argv[3]
var config = process.argv[4]

var datastore = require('./datastore.js')(auth)

// we create a new http server that does nothing but open a connection for socketio to make use of.
var app = require('http').createServer()
var io = require('socket.io')(app)

// Start listening on the port set by the environment.
app.listen(port, function(){
  console.log('Worker process ' + auth + ' listening on port: ' + port)
})

var connectedSockets = {} // each connected socket will be stored in this object so it can be refrenced easy

var debug = {
  log: function (message) {
    console.log(message)
  }
}

// Create an event for wne clients connect.
io.on('connection', function (socket){
  // We need the client to authenticate themselves with the server so set an
  // event 'authenticate' to listen for the response before making the request.
  socket.on('authenticate', function (data){
    if (data.type && data.type === 'authenticate')
      authenticateClient(data.identity, data.secret, this)
    else if (data.type && data.type === 'create')
      createClient(data, this)
    else
      socket.emit('err',{'message': 'Invalid request'}) // What a Terrible Failure!
  })

  debug.log('A new socket (' + socket.id + ') has connected to the server. Waiting for authentication.')
  // Now let the client know they are connected to the service and can now
  // make various request. Client should know if it needs to authenticate.
  // socket.emit('connected')
})

function connectSocket (identity, socket) {
  debug.log('Adding socket (' + socket.id + ') with identity (' + identity + ')')
  socket['__identity__'] = identity // The socket must know its own identity!
  connectedSockets[identity] = socket // Create an association between the User identity and this socket.
  setEventListeners(socket) // We need to setup the server to listen to the various socket events now that the client is authenticated.
  socket.emit('authenticated') // Let the client know they have been authenticated by emitting an 'authenticated' event.

  // Now that the client is online we need to notify all the subscribers.
  notifySubscribers(identity)
}

function notifySubscribers (identity) {
  debug.log('Server will now notify connected subscribers.')
  // The get subscribers function calls the callback function on each entity 
  // returned from the query to the datastore. 
  datastore.getSubscribers(identity, function (error, subscriber){
    if (error) {
      // This is a scilent error that really doesnt impact any of the clients.
      // Its just too bad no one knows your online....
      debug.log(error.message)
    }
    else {
      var socket = connectedSockets[subscriber]
      if (socket && subscriber !== identity) { // If there is a socket with the identity we issue an alert to it.
        debug.log('Server notification for client (' + socket.id + ') identity (' + socket.__identity__ + ') - ' + identity)
        socket.emit('notify', {'identity': identity})
      }
    }
  })
}

function broadcastSelf (socket) {
	socket.broadcast('notify')
}

function authenticateClient (identity, secret, socket) {
  debug.log('Authenticate socket (' + socket.id + ') with the server.')

  // Query the datastore for the authentication details to verify the client.
  datastore.findUser(identity, secret, function (error, data) {
    // Ask the client to re authenticate by emitting the authenticate event again.
    // This is not the more robust solution but it will work once the client isn't abusive.
    if (error) {
      debug.log('Socket (' + socket.id + ') provided the server with invalid authentication values.\n' + error.message)
      socket.emit('err', {message: 'Invalid username or password.'}) 
    }
    else {
      debug.log('Successfully authenticated socket (' + socket.id + ') with the server.')
      connectSocket(identity, socket)
    }
  })
}

function createClient (data, socket) {
  debug.log('Server is now setting up a new account for client ( '+ socket.id +' )')
  datastore.makeOrUpdateUser(data, function (error) {
    if (error) {
      debug.log('Could not create account for socket (' + socket.id + ').\n' + error.message)
      socket.emit('err', {message: 'Could not create account. Client may already exist.'})
    }
    else {
      debug.log('Successfully created and authenticated socket (' + socket.id + ') with the server.')
      connectSocket(data.identity, socket)
    }
  })
}


function disconnect (socket) {
  // Remove this socket from the list of connected sockets.
  delete connectedSockets[socket.__identity__]
}


function multipleSubscribe (list, socket) {
  debug.log('Client is trying to subscribe to (' + list.length + ') other users.')
  // First we need to check that each user they try to subscribe to exist in the datastore.
  datastore.findUsers(list, function (error, user, key) {
    // If there was an error or the user was not found we are going to ignore it for the time being.
    if(error || !user) { debug.log('Client does not exist. Subscription to (' + key + ') failed.') }
    else {
      datastore.subscribeTo(user.RowKey._, socket.__identity__, function (error, response) {
        if (error && error.message) debug.log('Failed to subscribe to Client - ' + error.message)
        else if (error) debug.log('Failed to subscribe to Client - Reason Unknown')
        else {
          debug.log(socket.__identity__ + ' successfully subscribed to the client (' + user.RowKey._ + ')')
          socket.emit('subscribed', user)
        }
      })
    }
  })
}


function singleSubscribe (identity, socket) {
  debug.log('Client is trying to subscribe to (' + identity + ').')
  datastore.findOneUser(identity, function (error, user, key) {
    if(error || !user) { debug.log('Client does not exist. Subscription to (' + key + ') failed.') }
    else {
      datastore.subscribeTo(user.RowKey._, socket.__identity__, function (error, response) {
        if (error && error.message) debug.log('Failed to subscribe to Client - ' + error.message)
        else if (error) debug.log('Failed to subscribe to Client - Reason Unknown')
        else {
          debug.log('Successfully subscribed to the client (' + user.RowKey._ + ')')
          socket.emit('subscribed', user)
        }
      })
    }
  })
}

// Sends message directly to a participant based on the identity.
function sendMessage (identity, message, socket) {
  // Get the participants socket.
  var participant = connectedSockets[identity]

  // If this participant has a socket we pipe the message over the socket to them.
  if (participant) {
    datastore.addStatistics({ transmission: 'outgoing', length: message.length, 'event': 'message' })
    participant.emit('message', { 'from': socket.__identity__, 'message' : message })
    socket.emit('notification', {type: 'message', delivery: 'successful'})
  } else {
    socket.emit('notification', {type: 'message', delivery: 'failed'})
  }
}

var setEventListeners = function (socket) {
  debug.log('Server is now setting up the client for communications')

  socket.on('disconnect', function() {
    debug.log('Event \'disconnect\' fired by client identity ' + socket.__identity__)
    disconnect(this)
  })

  // The subscribe event allows clients to subscribe to a list of users
  // if they exsist in the datastore. subscribe will emit the subscribed event
  // for each successful subscription made on the server.
  socket.on('subscribe', function (data) {
    datastore.addStatistics({ transmission: 'incoming', length: JSON.stringify(data).length, 'event': 'subscribe' })
    if (typeof data !== 'string' && data.length) { // If not string and has length property then assume array was passed.
      multipleSubscribe (data, socket)
    }
    else {
      singleSubscribe (data, socket)
    }
  })

  socket.on('getStats', function () {
    var socket = this
    datastore.getUsageStatistics(function (error, data) { 
      socket.emit('stats', {'error': error, 'data': data})
    })
  })

  socket.on('broadcast', function (broadcast) {
    socket.broadcast.emit('broadcast', broadcast)
  })

  socket.on('message', function (data) {
    datastore.addStatistics({ transmission: 'incoming', length: JSON.stringify(data).length, 'event': 'message' })
    sendMessage (data.identity, data.message, socket)
  })
}

