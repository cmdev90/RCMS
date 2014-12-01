import json, random, services, hashlib, user_services
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
	app.package_type = application['apptype']
	app.name = application['name']
	app.reigon = application['reigon']
	app.port = str(services.get_port())
	app.priority = priority	
	app.requests = str(0)
	app.cost = str(0)
	app_count = user_services.user_app_count(application['partition'])
	
	try:
		if app_count >= 0 :
			ts.insert_entity(table,app)
			app_count+=1
			if user_services.update_app_count(application['partition'], app_count):
				return app_count
			else :
				return -1
		# return True
	except Exception, e:		
		return -1



def getUserApps(partition):	
	list = []
	try:
		apps = ts.query_entities(table, "PartitionKey eq '"+partition+"'")
		for a in apps :
			list.append(a.__dict__)	
		return list
	except Exception, e:
		return None		


def delete_user_app(partition, rowkey):
	app_count = user_services.user_app_count(partition)
		
	try:
		if app_count > 0:	
			ts.delete_entity(table, partition, rowkey)	
			app_count-=1
			if user_services.update_app_count(partition, app_count):
				return app_count
			else :
				return -1
	except Exception, e:
		print e
		return -1
		

def update_user_package(data):
	print json.dumps(data)
	package = {"package_type" : data['package_type']}
	try:
		ts.update_entity(table, data['partition'], data['rowkey'],package)
		return True
	except Exception, e:
		return False
	
