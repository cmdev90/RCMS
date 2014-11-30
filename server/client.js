
module.exports = function (key){
	var azure = require('azure-storage')
		, account_name = 'rcms' // Azure account information for accessing the table storage.
		, account_key = '9L1kZqrgAovvt1KI3xOfRj6RxLPt+hWpAI2mfsJ3zpf6DjMCN/TqYcaCb956jYG8qELgWpv0T0Cn5OC4vCPOng=='
		

	var tableSvc = azure.createTableService(account_name, account_key)

	// Create a new parition on the table by owner key.
	tableSvc.createTableIfNotExists('MessageClient', function(error, result, response){
	    if(!error){
	        // Table exists or created
	    }
	})
	

	var entGen = azure.TableUtilities.entityGenerator
	var client = {
		PartitionKey: entGen.String(key),
		RowKey: entGen.String('1'),
		description: entGen.String('take out the trash'),
		dueDate: entGen.DateTime(new Date(Date.UTC(2015, 6, 20))),
	}
}

