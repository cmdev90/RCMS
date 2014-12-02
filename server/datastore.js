
module.exports = function (partitionKey){
	var azure = require('azure-storage')
		, _ = require('lodash')
		, hat = require('hat')
		, account_name = 'rcms' // Azure account information for accessing the table storage.
		, account_key = '9L1kZqrgAovvt1KI3xOfRj6RxLPt+hWpAI2mfsJ3zpf6DjMCN/TqYcaCb956jYG8qELgWpv0T0Cn5OC4vCPOng=='
		, table = 'MessageClient'
		, usageTable = 'Usage'
		, subscriptionTable = 'Subscription'

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

	tableSvc.createTableIfNotExists(subscriptionTable, function(error, result, response){
	    if(!error){
	        // Table exists or created
	    }
	})


	function makeOrUpdateUser(data, fn) {
		// identity and secret are required variable.
		if (!data.identity && !data.secret) return fn(true);
		else {
			var entGen = azure.TableUtilities.entityGenerator
				, user = {
					PartitionKey: entGen.String(partitionKey)
					, RowKey: entGen.String(data.identity)
					, secret: entGen.String(data.secret)
				}

			tableSvc.insertEntity(table, user, function (error, result, response) {
				if(error) return fn(error)
				return fn(null, result)
			});
		}
	}


	function findUser(key, secret, fn) {
		tableSvc.retrieveEntity(table, partitionKey, key, function (error, data, response){
			if(error) return fn(error)

			// If the user was found then check that they know the secret.
			if(data && data.secret._ === secret)
				return fn(null, data)
			// Else return an error for lazyness.
			return fn(true)
		})
	}

	// the fn function should define what to do once the user is found.
	function findUsers (keylist, fn) {
	    _.each(keylist, function(key) {
			tableSvc.retrieveEntity(table, partitionKey, key, function (error, data, response){
				if(error) fn(error, null, key)
				else fn(null, data, key)
			})
	    })
	}

	function addStatistics(data, fn) {
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
			// if(error) return fn(error)

			// if (result)
			// 	return fn(null, result)

			// return fn(true)
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


	function findOneUser (key, fn) {
		tableSvc.retrieveEntity(table, partitionKey, key, function (error, data, response){
			if(error) fn(error, null, key)
			else fn(null, data, key)
		})	
	}


	function subscribeTo (subject, observer, fn) {
		if (subject === observer) fn(true)
		else {
			var entGen = azure.TableUtilities.entityGenerator
				, subscription = {
					PartitionKey: entGen.String(subject)
					, RowKey: entGen.String(observer)
				}

			tableSvc.insertEntity(subscriptionTable, subscription, function (error, data, response){
				if(error) return fn(error)

				if(data)
					return fn(null, data)
				return fn(true)
			})
		}
	}


	function getSubscribers (key, fn) {
		var query = new azure.TableQuery().where('PartitionKey eq ?', key)

		tableSvc.queryEntities(subscriptionTable, query, null, function (error, users, response){
			if (error) fn(error)
			else {
				_.each(users.entries, function (user){
					if (user && user.RowKey) fn(null, user.RowKey._) // return the identity of this subscriber.
					else fn(null, user)  // else just return the null user object. It will be handled by callback.
				})
			}
		})
	}


	return {
		makeOrUpdateUser: makeOrUpdateUser
		, findUser: findUser
		, addStatistics: addStatistics
		, getUsageStatistics: getUsageStatistics
		, findUsers: findUsers
		, subscribeTo: subscribeTo
		, findOneUser: findOneUser
		, getSubscribers: getSubscribers
	}


}

