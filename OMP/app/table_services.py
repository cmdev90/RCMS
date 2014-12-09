import json, random, services, hashlib, user_services, app_services, notifying
from azure.storage import TableService, Entity


account_name = 'rcms'     
account_key = '9L1kZqrgAovvt1KI3xOfRj6RxLPt+hWpAI2mfsJ3zpf6DjMCN/TqYcaCb956jYG8qELgWpv0T0Cn5OC4vCPOng=='
table = 'applications'
priority = '200'

unique_sequence = services.uniqueid() # next(unique_sequence)


ts = TableService(account_name = account_name, account_key = account_key)
ts.create_table(table)

# ts.delete_table(table)	


def saveApplication(application):
	app = Entity()
	app.PartitionKey = application['partition'] #uiquely identifies a partition of entities 
	app.RowKey = str(next(unique_sequence)) 	
	# app.RowKey = "kjlhajkdlhfjhasdnfasdkjflnasdf"	
	app.package_type = application['apptype']
	app.name = application['name']
	app.reigon = application['reigon']
	app.port = str(services.get_port())
	app.priority = priority	
	app.requests = str(0)
	app.cost = str(0)
	user = user_services.get_user_by_email(application['partition']) #get the current user
	if user is not None:

		app_count = int(user.app_count) #get app count an convert to int
		try:
			if app_count >= 0 : #if there is a valid amount of apps
				ts.insert_entity(table,app) #add new app
				print "new app created"
				app_count+=1 #increase the count
				user.app_count = str(app_count) #convert count back to str
				if user_services.update_user(application['partition'], user): #update the user count
					print "user app count updated"
					print "notifying that a new app was created..."
					temp = {
						"partition" 	: app.PartitionKey,
						"rowkey"		: app.RowKey,
						"package_type" 	: app.package_type,
						"status" 		: "created"
					}
					notifying.notify_client("http://146.148.74.93:3000/update_package", temp)
					print " success"
					return app_count
				else :
					return -1
			# return True
		except Exception, e:		
			return -1
	else :
		return -1


def getUserApps(partition):	
	
	try:
		apps = update_cost_requests(partition)	
		return apps
	except Exception, e:
		return None		

def get_application(partition, rowkey):
	try:
		app = ts.get_entity(table, partition, rowkey)	
		return app
	except Exception, e:
		return None			



def delete_user_app(partition, rowkey):
	user = user_services.get_user_by_email(partition)	
	if user is not None:
		count = int(user.app_count)
		try:
			if count > 0:	
				ts.delete_entity(table, partition, rowkey)	
				print "app deteted"
				count-=1
				user.app_count = str(count)
				if user_services.update_user(partition, user):
					print "updated user app count"
					print "notifying that an app was deleted"
					temp = {
						"partition" 	: partition,
						"rowkey"		: rowkey,
						"package_type" 	: "",
						"status" 		: "deleted"
					}
					notifying.notify_client("http://146.148.74.93:3000/update_package", temp)
					print "success"
					return count
				else :
					return -1
		except Exception, e:
			print e
			return -1
	else :
		return -1
		


def update_user_package(data):
	app = get_application(data['partition'], data['rowkey'])
	if app is not None:
		app.package_type = data['package_type']
		try:
			ts.update_entity(table, data['partition'], data['rowkey'],app)
			print "app updated"
			print "updated user app count"
			print "notifying that an app was updated"
			temp = {
				"partition" 	: app.PartitionKey,
				"rowkey"		: app.RowKey,
				"package_type" 	: app.package_type,
				"status" 		: "update"
			}
			notifying.notify_client("http://146.148.74.93:3000/update_package", temp)
			print "success"
			return True
		except Exception, e:
			return False
	else :
		return False

		

def get_package(partition, rowkey):
	a = get_application(partition, rowkey)
	if a is not None:
		return services.get_package(a.package_type)
	else :
		return None


def update_cost_requests(partition):
	list = []
	try:
		
		apps = ts.query_entities(table, "PartitionKey eq '"+partition+"'")

		for a in apps :
			temp = app_services.get_cost_and_requests(a.RowKey)
			# temp = app_services.get_cost_and_requests("kjlhajkdlhfjhasdnfasdkjflnasdf")
			if temp is not None:
				a.cost = temp['cost']
				a.requests = temp['requests']
				ts.update_entity(table, partition, a.RowKey,a)
			list.append(a.__dict__)
		return list	
	except Exception, e:
		print e
		return None