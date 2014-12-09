var proc = require('child_process')
	, express = require('express')
	, app = express()
	, azure = require('azure-storage')
	, account_name = 'rcms' // Azure account information for accessing the table storage.
	, account_key = '9L1kZqrgAovvt1KI3xOfRj6RxLPt+hWpAI2mfsJ3zpf6DjMCN/TqYcaCb956jYG8qELgWpv0T0Cn5OC4vCPOng=='

var bodyParser = require('body-parser')
var multer = require('multer') 

app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(multer()) // for parsing multipart/form-data

// Create client record object here. This is all kept in the 
// applications main memory for convience.
var RunRecords = {}

// Setup this process as the master process
//cluster.setupMaster({ exec : "worker.js" })

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
			console.log("Master will now restart instance " + instance.id + " from the working pool " + key)
			instance.kill()
			var env = {config: 'free'}
			RunRecords[key]["instance"] = proc.fork('worker.js',[RunRecords[key]['port'], key, 'free'])
		} 
		catch (err) {
			fn(err, null)
		}
	}
	else {
		try {
			RunRecords[key]["instance"] = proc.fork('worker.js',[RunRecords[key]['port'], key, 'free'])
			console.log("Master successfully created instance " + key + " and added it to the working pool.")
		} 
		catch (err) {
			fn(err, null)
		}
	}

	// All processing was successfully completed
	fn(null, "Success")
}


var tableSvc = azure.createTableService(account_name, account_key)
tableSvc.createTableIfNotExists('users', function(error, result, response){
    if(!error){
        // Table exists or created
    }
})

var query = new azure.TableQuery().where('PartitionKey eq \'users\'')

tableSvc.queryEntities('users', query, null, function (error, data, response) {
	for (var index in data.entries){
		var user = data.entries[index].RowKey._

		var query2 = new azure.TableQuery().where('PartitionKey eq ?', user)
		tableSvc.queryEntities('applications', query2, null, function (error, data, response) {
			for (var index in data.entries){
				var application = data.entries[index]
				UpdateInstancePackage({
					_package: application.package_type._
					, _authKey: application.RowKey._
					, _port: application.port._
					, _priority: 200
				}, function (error, response){
					if (error) console.log(error)
				})
			}
		})
	}
})

// Go into the azure and pull this clients records. Compare the differences
// between the running instances and what it should be on record.
app.post('/update_package', function (req, res) {
	//console.log(req.body)
	//var body = JSON.parse(req.body)
	// Set up variables we are going to need
	var partitionKey = req.body['partition']
		, rowKey = req.body['rowkey']
		, tableService = azure.createTableService(account_name, account_key) // by creating a new table service!

	if (partitionKey && rowKey) {
		// Try to retrieve the entity from the the table storage.
		tableService.retrieveEntity('applications', partitionKey, rowKey, function (error, data, response){
			if(error) return res.send(error)
			if (data) {
				UpdateInstancePackage({_package: data.package_type._, _port: data.port._, _authKey: data.RowKey._, _priority: 200}, function (error, response){
					if (error) return res.send(error)
					return res.send(response)
				})
			}
			else {
	 			return res.send('response' + response)
	 		}
		})
	} else {
		res.send('Invalid request.')
	}
})

var port = process.env.PORT || 3000
app.listen(port, function () {
  console.log('Node manager listening at port %s', port)
})

