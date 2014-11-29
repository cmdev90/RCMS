import json, random, services
from azure.storage import TableService, Entity


account_name = 'rcms'     
account_key = '9L1kZqrgAovvt1KI3xOfRj6RxLPt+hWpAI2mfsJ3zpf6DjMCN/TqYcaCb956jYG8qELgWpv0T0Cn5OC4vCPOng=='
table = 'storage'
priority = '200'
unique_sequence = services.uniqueid() # next(unique_sequence)


ts = TableService(account_name = account_name, account_key = account_key)
ts.create_table(table)
# ts.delete_table(table)	


def createUser(new_user):
	user = Entity()
	user.PartitionKey = new_user["username"]  #uiquely identifies a partition of entities 
	user.RowKey = new_user["password"] # row key will uniquely identify a particular entity	
	user.package_type = services.package_free 
	user.key = str(next(unique_sequence)) 
	user.email = new_user["email"]
	user.firstname = new_user["firstname"]
	user.lastname = new_user["lastname"]
	user.package = json.dumps(services.get_package(services.package_free))
	user.port = str(services.get_port())
	user.priority = priority
	
	try:
		ts.insert_entity(table,user)
		return True
	except Exception, e:		
		return False


def get_user_by_username(username):
	try:
		user = ts.query_entities(table, "PartitionKey eq '"+username+"'")
		return json.dumps(user[0].__dict__) #users_to_json(user)
	except Exception, e:
		return None


def authenticate(username, password):
	try:
		user = ts.get_entity(table, username, password)
		return json.dumps(user.__dict__)
	except Exception, e:
		return None	


def update_user_package(data):
	user = {"package_type" : data['package'], "package" : json.dumps(services.get_package(data['package']))}
	try:
		ts.update_entity(table, data['username'], data['password'],user)
		return True
	except Exception, e:
		return False
	