
var app = require('express')()
		, http = require('http').Server(app)
		, io = require('socket.io')(http)
		, cluster = require('cluster')
		, numCPUs = require('os').cpus().length
		, hat = require('hat')



var auth = 'kjlhajkdlhfjhasdnfasdkjflnasdf'
var config = 'basic'
var port = 3010

var _ = require('lodash');
var crypto = require('crypto');
var datastore = require('./datastore.js')(auth)

// Holds an up-to-date list of all the connected users.
var connected = [];

var debug = {
	log: function (message) {
		console.log(message)
	}
}

// Auto generate a random string of lenght len;
var autoGen = function(len) {
		var map = "1234567890poiuytrewqasdfghjklmnbvcxz~!@#$%^&*POIUYTREWQASDFGHJKLMNBVCXZ",
				str = "";

		for(var i=0; i<len; ++i) {
			rand = Math.floor(Math.random() * map.length);
			str += map[rand];
		}

		return str;
};

var hash = function(password) {
		var salt = '3EKJ2_@&Ea',
				saltedpassword = password + salt;

		var sha1 = crypto.createHash('sha1').update(saltedpassword),
				hash = sha1.digest("hex");

		return hash;
};

//  Helper function!
// ==================

var setupClient = function (socket) {
		debug.log('Server is now setting up the client for communications');

		socket.on('disconnect', function() {
			debug.log('Event \'disconnect\' fired by client ' + socket.id)
			//disconnect(this);
		});

		// The subscribe event allows clients to subscribe to a list of users
		// if they exsist in the datastore. subscribe will emit the subscribed event
		// for each successful subscription made on the server.
		socket.on('subscribe', function (data) {
			var socket = this; // lets keep a refrence to the socket just in case we need it.

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
			//openChat(this, data);
		});

		socket.on('acknowledge', function(data) {
			//joinRoom(this, data);
		});

		socket.on('message', function(data) {
			debug.log(data);
			debug.log(this.__data__);
			//socket.broadcast.to(data.room).emit('message', data);
		});

		socket.emit('authenticated')
}

var getNonce = function(id) {
	return _.find(connected, {cid : id}).nonce;
};

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
		// Using autoGen create a nonce of length 20;
		var nonce = autoGen(20);

		// Send the client details about themselves as kept by the server.
		socket.emit('authenticate', {
			me : socket.id,
			nonce : nonce,
		});

		// If this is not a free package then we must wait for the client to authenticate
		// before we allow the access to the chat facilities.
		if (config !== 'free') {
			debug.log('Non-free package detected. Waiting for authentication to setting up the client for communcations.');
			
			// listen to see of the client sends any authentication details.
			socket.on('identify', function (data){
				var currSocket = this
				debug.log('Client has responded to the identity request.')

				// First we need to ensure the client is who they claim to be.
				secureConnection(data.nonce, currSocket, function (err){
					if (err) {
						debug.log('The client did not pass the nounce test. Ignoring request')
						return false;
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
			debug.log('Free package detected. Bypassing authentication.');
			setupClient(socket)
		}

		// Add the client to list of connected clients.
		// Hash the nonce so that other clients can't view it.
		connected.push({cid : socket.id, nonce : hash(nonce), __socket: socket});
};


io.sockets.on('connection', function(socket, data) {
	// When a new client has connected to this socket we add it to the connection pool.
	// Depending on the configuration of the Server, the client may not be added to
	// the standard event listeners, muting the client from chat until they authenticate.
	connect(socket)
});


http.listen(port, function(){
		debug.log('listening on *:' + port)
})
