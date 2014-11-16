var cluster = require('cluster')
	, express = require('express')
	, app = express()
	, azure = require('azure-storage')

// Azure account information for accessing the table storage.
var account_name = 'rcms'     
	, account_key = '9L1kZqrgAovvt1KI3xOfRj6RxLPt+hWpAI2mfsJ3zpf6DjMCN/TqYcaCb956jYG8qELgWpv0T0Cn5OC4vCPOng=='
	

// Create client record object here. This is all kept in the 
// applications main memory for convience.
var RunRecords = {}

// Setup this process as the master process
cluster.setupMaster({
  exec : "worker.js",
  args : ["--use", "https"],
  silent : true
});

// updates the run record 
var UpdateRunRecords = function (data, fn) {
	var key = data.PartitionKey._ + data.RowKey._

	if (RunRecords[key]){
		// The record already exsit so we have to be careful how 
		// the update is performed!
		RunRecords[key]['node_count'] = data.nodes._
	}
	else {
		RunRecords[key] = {
			'node_count' : data.nodes._
			, 'node_cluster' : []
		}
	}

	// Finally we need to maintain the cluster associated
	// with this record by adding or removing nodes.
	MaintainCluster(key, fn)
}


var MaintainCluster = function (key, fn) {

}

// Go into the azure and pull this clients records. Compare the differences
// between the running instances and what it should be on record.
app.get('/update/:username/:password', function (req, res) {
	// Set up variables we are going to need
	var partitionKey = req.params['username']
		, rowKey = req.params['password']
		, table = 'users'
		, tableService = azure.createTableService(account_name, account_key) // by creating a new table service!


	// Try to retrieve the entity from the the table storage.
	tableService.retrieveEntity(table, partitionKey, rowKey, function (error, result, response){

		if(error) return res.send('Goodbye cruel world!' + error)
		if (result) {
			UpdateRunRecords(result, function (error, result){
				if (error) return res.send(error)

				return res.send(RunRecords)
			})
		}
		return res.send('response' + response)
	})
  
})

var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Node manager listening at http://%s:%s', host, port)

})

