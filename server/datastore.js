
module.exports = function (partitionKey){
	var azure = require('azure-storage')
		, hat = require('hat')
		, account_name = 'rcms' // Azure account information for accessing the table storage.
		, account_key = '9L1kZqrgAovvt1KI3xOfRj6RxLPt+hWpAI2mfsJ3zpf6DjMCN/TqYcaCb956jYG8qELgWpv0T0Cn5OC4vCPOng=='
		, table = 'MessageClient'
		, usageTable = 'Usage'

	var tableSvc = azure.createTableService(account_name, account_key)
	var entGen = azure.TableUtilities.entityGenerator

	// Create a new parition on the table by owner partitionKey.
	tableSvc.createTableIfNotExists(table, function(error, result, response){
	    if(!error){
	        // Table exists or created
	    }
	})

	tableSvc.createTableIfNotExists(usageTable, function(error, result, response){
	    if(!error){
	        // Table exists or created
	    }
	})


	function makeOrUpdateUser(data, fn) {
		var entGen = azure.TableUtilities.entityGenerator
			, user = {
				PartitionKey: entGen.String(partitionKey)
				, RowKey: entGen.String(data.id)
				, password: entGen.String(data.password)
			}

		tableSvc.insertOrMergeEntity(table, user, function (error, result, response) {
			if(error) return fn(error)
			return fn(null, result)
		});
	}


	function findUser(key, secret, fn) {
		tableSvc.retrieveEntity(table, partitionKey, key, function (error, data, response){
			if(error) return fn(error)

			// If the user was found then check that they know the secret.
			if(data && data.password._ === secret)
				return fn(null, data)
			// Else return an error for lazyness.
			return fn(true)
		})
	}


	function updateStatistics(data, fn) {
		var uniqueID = new Date().getTime().toString()

		var statsUpdate = {
			PartitionKey: entGen.String(partitionKey)
			, RowKey: entGen.String(uniqueID) 
		}

		// add the properties in the data object to the statsUpdate object.
		for(var prop in data) {
			statsUpdate[prop] = entGen.String(data[prop].toString())
		}

		// save the new statistics to the datastore.
		tableSvc.insertEntity(usageTable, statsUpdate, function(error, result, response){
			if(error) return fn(error)

			if (result)
				return fn(null, result)

			return fn(true)
		})
	}


	function getUsageStatistics(fn) {
		var query = new azure.TableQuery().where('PartitionKey eq ?', partitionKey)

		tableSvc.queryEntities(usageTable, query, null, function (error, data, response){
			if(error) return fn(error)

			if(data)
				return fn(null, data)
			return fn(true)
		})
	}


	return {
		makeOrUpdateUser: makeOrUpdateUser
		, findUser: findUser
		, updateStatistics: updateStatistics
		, getUsageStatistics: getUsageStatistics
	}


}

