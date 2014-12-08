  var Connection = (function() {
    var socket

    var connection = function(server, port, responseHandler){
      socket = io.connect(server + ':' + port)
      socket.on('connect', responseHandler)
    }

    connection.prototype.authenticate = function (identity, secret, responseHandler) {
      socket.emit('authenticate', {
        'identity': identity
        , 'secret': secret
        , 'type': 'authenticate'
      })

      socket.on('authenticated', responseHandler)
    }

    connection.prototype.create = function (identity, secret, name, responseHandler) {
      socket.emit('authenticate', {
        'identity': identity
        , 'secret': secret
        , 'name': name
        , 'type': 'create'
      })

      socket.on('authenticated', responseHandler)
    }

    connection.prototype.subscribe = function (identities, responseHandler) {
      socket.emit('subscribe', identities)
      socket.on('subscribed', responseHandler)
    }

    connection.prototype.sendMessage = function (identity, message) {
      socket.emit('message', {'identity': identity, 'message': message})
    }

    connection.prototype.recieveMessage = function (messageHandler) {
      socket.on('message', messageHandler)
    }

    connection.prototype.handleError = function (errorHandler) {
      socket.on('err', errorHandler)
    }

    connection.prototype.handleAlert = function (alertHandler) {
      socket.on('alert', alertHandler)
    }

    connection.prototype.handleNotification = function (notificationHanler) {
      socket.on('notification', notificationHanler)
    }

    connection.prototype.getSocket = function () {
      return socket
    }

    return connection
  }())