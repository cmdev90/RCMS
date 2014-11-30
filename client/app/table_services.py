import json, random, services, hashlib
from azure.storage import TableService, Entity


account_name = 'rcms'     
account_key = '9L1kZqrgAovvt1KI3xOfRj6RxLPt+hWpAI2mfsJ3zpf6DjMCN/TqYcaCb956jYG8qELgWpv0T0Cn5OC4vCPOng=='
table = 'storage'
priority = '200'
partition = 'users'
unique_sequence = services.uniqueid() # next(unique_sequence)


ts = TableService(account_name = account_name, account_key = account_key)
ts.create_table(table)

# ts.delete_table(table)	


def createUser(new_user):
	user = Entity()
	user.PartitionKey = partition #uiquely identifies a partition of entities 
	user.RowKey = new_user["email"]
	user.password = new_user["password"]
	user.package_type = services.package_free 
	user.key = str(next(unique_sequence)) 	
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


def get_user_by_email(email):
	try:
		user = ts.get_entity(table, partition, email)	
		return user.__dict__
	except Exception, e:
		return None


def authenticate(email, password):

	try:		
		user = ts.get_entity(table, partition, email)		

		if user.password == hashlib.sha1(password).hexdigest():
			return json.dumps(user.__dict__)
		else :
			return None
		
	except Exception, e:
		return None	


def update_user_package(data):
	print json.dumps(data)
	user = {"package_type" : data['package'], "package" : json.dumps(services.get_package(data['package']))}
	try:
		ts.update_entity(table, partition, data['email'],user)
		return True
	except Exception, e:
		return False
	
