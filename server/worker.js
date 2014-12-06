
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
      socket.emit('error',{'message': 'Invalid request'}) // What a Terrible Failure!
  })

  // Now ask the client to authenticate themselves with the service
  // by emitting an 'authenticate' event over the socket.
  socket.emit('authenticate')
})


var debug = {
  log: function (message) {
    console.log(message)
  }
}

function connectSocket(identity, socket) {
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
        socket.emit('online', {'identity': identity})
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
      socket.emit('error', {message: 'Invalid username or password.'}) 
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
      socket.emit('error', {message: 'Could not create account. Client may already exist.'})
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
    participant.emit('message', { 'message' : message })
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



/*
var app = require('express')()
		, http = require('http').Server(app)
		, io = require('socket.io')(http)
		, cluster = require('cluster')
		, numCPUs = require('os').cpus().length
		, hat = require('hat')



var auth = 'kjlhajkdlhfjhasdnfasdkjflnasdf'
var config = 'basic'
var port = 3010

var _ = require('lodash')
var crypto = require('crypto')
var datastore = require('./datastore.js')(auth)

// Holds an up-to-date list of all the connected users.
var connected = []

var debug = {
	log: function (message) {
		console.log(message)
	}
}

// Auto generate a random string of lenght len
var autoGen = function(len) {
		var map = "1234567890poiuytrewqasdfghjklmnbvcxz~!@#$%^&*POIUYTREWQASDFGHJKLMNBVCXZ",
				str = ""

		for(var i=0 i<len ++i) {
			rand = Math.floor(Math.random() * map.length)
			str += map[rand]
		}

		return str
}

var hash = function(password) {
		var salt = '3EKJ2_@&Ea',
				saltedpassword = password + salt

		var sha1 = crypto.createHash('sha1').update(saltedpassword),
				hash = sha1.digest("hex")

		return hash
}

//  Helper function!
// ==================

var containsO = function(arr, target) {
    var flag = false
    _.each(arr, function(object) {
      if(_.contains(object, target))
        flag = true
    })
    return flag
}

var disconnect = function(socket) {
    // Broadcast removal of socket from list.
    socket.broadcast.emit('alert', { 
      type : FLAGS.REM,
      cid : socket.id,
    })

    // Update the connection list.
    _.remove(connected, function(client) {
      return client.cid === socket.id
    })
}

var openChat = function(socket, data) {

    if (containsO(connected, data.id)) {
      // Generate a room name of 30 chars long.
      var room_name = autoGen(30)

      socket.broadcast.emit('alert', {
        type : FLAGS.CREQ,
        cid : data.id,
        room : room_name,
      })

      socket.join(room_name)

      socket.emit('alert',{
        type : FLAGS.JOINT,
        room : room_name,
      })
    } else {
      socket.emit('err')
    }
}

var joinRoom = function(socket, data) {
    if(hash(data.nonce) === getNonce(socket.id)) {
      socket.join(data.room)
      socket.emit('alert',{
        type : FLAGS.JOINT,
        room : data.room,
      })
    }
}

var setupClient = function (socket) {
		debug.log('Server is now setting up the client for communications')

		socket.on('disconnect', function() {
			debug.log('Event \'disconnect\' fired by client ' + socket.id)
			//disconnect(this)
		})

		// The subscribe event allows clients to subscribe to a list of users
		// if they exsist in the datastore. subscribe will emit the subscribed event
		// for each successful subscription made on the server.
		socket.on('subscribe', function (data) {
			var socket = this // lets keep a refrence to the socket just in case we need it.

			if (typeof data !== 'string' && data.length) { // If not string and has length property then assume array was passed.
				debug.log('Client is trying to subscribe to (' + data.length + ') other users.')
				// First we need to check that each user they try to subscribe to exist in the datastore.
				datastore.findUsers(data, function (error, user, key) {
					// If there was an error or the user was not found we are going to ignore it for the time being.
					if(error || !user) { debug.log('Client does not exist. Subscription to (' + key + ') failed.') }
					else {
						datastore.subscribeTo(user.RowKey._, socket.__data__.RowKey._, function (error, response) {
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
			else {
				debug.log('Client is trying to subscribe to (' + data + ').')
				datastore.findOneUser(data, function (error, user, key) {
					if(error || !user) { debug.log('Client does not exist. Subscription to (' + key + ') failed.') }
					else {
						datastore.subscribeTo(user.RowKey._, socket.__data__.RowKey._, function (error, response) {
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
		})

		socket.on('chat', function(data) {
			openChat(this, data)
		})

		socket.on('acknowledge', function(data) {
			joinRoom(this, data)
		})

		socket.on('message', function(data) {
			debug.log(data)
			debug.log(this.__data__)
			socket.broadcast.to(data.room).emit('message', data)
		})

		socket.emit('authenticated')
}

var getNonce = function(id) {
	return _.find(connected, {cid : id}).nonce
}

var secureConnection = function (nonce, socket, fn) {
	debug.log('Checking validating client identity to server.')
	if (hash(nonce) === getNonce(socket.id)) {
		fn(null)
	}
	else {
		fn (true)
	}
}

var connect = function(socket) {
		// Using autoGen create a nonce of length 20
		var nonce = autoGen(20)

		// Send the client details about themselves as kept by the server.
		socket.emit('authenticate', {
			me : socket.id,
			nonce : nonce,
		})

		// If this is not a free package then we must wait for the client to authenticate
		// before we allow the access to the chat facilities.
		if (config !== 'free') {
			debug.log('Non-free package detected. Waiting for authentication to setting up the client for communcations.')
			
			// listen to see of the client sends any authentication details.
			socket.on('identify', function (data){
				var currSocket = this
				debug.log('Client has responded to the identity request.')

				// First we need to ensure the client is who they claim to be.
				secureConnection(data.nonce, currSocket, function (err){
					if (err) {
						debug.log('The client did not pass the nounce test. Ignoring request')
						return false
					}
					else {
						debug.log('A valid client is trying to authenticate with the server.')
						// Data object has a type which will dictate how the identity will be handled.
						if (data.type === 'authenticate') {
							debug.log('Client request type is authenticate.')
							// The client is trying to authenticate. Data object should contain an identity and
							// a secret we can use to authenticate them by.
							datastore.findUser(data.identity, data.secret, function (error, data) {
								if (!error) {
									currSocket['__data__'] = data
									setupClient(currSocket)
								}
								else debug.log('Invalid credentials. Client not setup to communicate.') // Note to self: define an event to alert client of this error.
							})
						}
						else if (data.type === 'create') {
							debug.log('Client request type is create user.')
							datastore.makeOrUpdateUser(data, function (error) {
								if (!error) setupClient(currSocket)
								else debug.log('There was an error creating this new user: ' + error.message)
							})
						}
						else {
							// This is an error state and idk what to do about it atm so lets just ignore it....
						}
					}
				})
			})
		}
		else {
			// Otherwise run the setup procedure and attach all the events
			// needed for chat and notifications.
			debug.log('Free package detected. Bypassing authentication.')
			setupClient(socket)
		}

		// Add the client to list of connected clients.
		// Hash the nonce so that other clients can't view it.
		connected.push({cid : socket.id, nonce : hash(nonce), __socket: socket})



		console.log(connected)
}


io.sockets.on('connection', function(socket, data) {
	// When a new client has connected to this socket we add it to the connection pool.
	// Depending on the configuration of the Server, the client may not be added to
	// the standard event listeners, muting the client from chat until they authenticate.
	connect(socket)
})


http.listen(port, function(){
		debug.log('listening on *:' + port)
})
*/