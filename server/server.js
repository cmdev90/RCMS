var cluster = require('cluster')
	, express = require('express')
	, app = express()
	, azure = require('azure-storage')
	, account_name = 'rcms' // Azure account information for accessing the table storage.
	, account_key = '9L1kZqrgAovvt1KI3xOfRj6RxLPt+hWpAI2mfsJ3zpf6DjMCN/TqYcaCb956jYG8qELgWpv0T0Cn5OC4vCPOng=='
	

// Create client record object here. This is all kept in the 
// applications main memory for convience.
var RunRecords = {}

// Setup this process as the master process
cluster.setupMaster({ exec : "worker.js" })

// updates the run record 
var UpdateInstancePackage = function (data, fn) {
	var key = data._authKey


	// If the record already exsit we just update the package field,
	if (RunRecords[key])
		RunRecords[key]['package'] = data._package
	else {
		// else we just create the new record.
		RunRecords[key] = { 'package': data._package, 'port': data._port }
	}

	// Finally we need to update the running instance associated with the account.
	MaintainInstance(key, fn)
}


var MaintainInstance = function (key, fn) {
	var instance = RunRecords[key]["instance"]

	if (instance) {
		try {
			console.log("Master will now kill instance " + instance.id + " from the working pool " + key)
			instance.kill()
			RunRecords[key]["instance"] = cluster.fork({port: RunRecords[key]['port']})
		} 
		catch (err) {
			fn(err, null)
		}
	}
	else {
		try {
			RunRecords[key]["instance"] = cluster.fork({port: RunRecords[key]['port'], 'package': RunRecords[key]['port'] })
			console.log("Master successfully created instance " + RunRecords[key]["instance"].id + " and added it to the working pool " + key)
		} 
		catch (err) {
			fn(err, null)
		}
	}

	// All processing was successfully completed
	fn(null, "Success")
}

// Go into the azure and pull this clients records. Compare the differences
// between the running instances and what it should be on record.
app.get('/update_package/:package/:auth/:port', function (req, res) {
	var data = {
		_package: req.params['package']
		, _authKey: req.params['auth']
		, _port: req.params['port']
	}

	// // Set up variables we are going to need
	// var partitionKey = req.params['username']
	// 	, rowKey = req.params['password']
	// 	, table = 'users'
	// 	, tableService = azure.createTableService(account_name, account_key) // by creating a new table service!


	// // Try to retrieve the entity from the the table storage.
	// tableService.retrieveEntity(table, partitionKey, rowKey, function (error, data, response){

	// 	if(error) return res.send('Goodbye cruel world!' + error)
	// 	if (data) {
			UpdateInstancePackage(data, function (error, response){
				if (error) return res.send(error)

				var i = 0
				for (var r in RunRecords){
					i++
				}

				console.log(i)

				return res.send("Success")
			})
	// 	}
	// 	// return res.send('response' + response)
	// })
})

var port = process.env.PORT || 3000
app.listen(port, function () {
  console.log('Node manager listening at port %s', port)
})

