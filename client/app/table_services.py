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


# def update_user_package(data):
# 	print json.dumps(data)
# 	user = {"package_type" : data['package'], "package" : json.dumps(services.get_package(data['package']))}
# 	try:
# 		ts.update_entity(table, partition, data['email'],user)
# 		return True
# 	except Exception, e:
# 		return False
	
