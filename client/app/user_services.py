import json, random, services, hashlib
from azure.storage import TableService, Entity


account_name = 'rcms'     
account_key = '9L1kZqrgAovvt1KI3xOfRj6RxLPt+hWpAI2mfsJ3zpf6DjMCN/TqYcaCb956jYG8qELgWpv0T0Cn5OC4vCPOng=='
table = 'users'
priority = '200'
partition = "users"
unique_sequence = services.uniqueid() # next(unique_sequence)

ts = TableService(account_name = account_name, account_key = account_key)
ts.create_table(table)

# ts.delete_table(table)

def createUser(new_user):
	user = Entity()
	user.PartitionKey = partition
	user.RowKey = new_user["email"]
	user.password = new_user["password"]		
	user.firstname = new_user["firstname"]
	user.lastname = new_user["lastname"]	
	user.priority = priority	
	user.app_count = str(0)	

	try:
		ts.insert_entity(table,user)
		return True
	except Exception, e:	
		print e	
		return False


def authenticate(email, password):

	try:		
		user = ts.get_entity(table, partition, email)		

		if user.password == hashlib.sha1(password).hexdigest():
			return user.__dict__
		else :
			return None
		
	except Exception, e:
		print e
		return None			


def get_user_by_email(email):
	try:
		user = ts.get_entity(table, partition, email)	
		return user
	except Exception, e:
		return None		

def update_user(email, user):
	try:		
		ts.update_entity(table, partition, email ,user)
		return True
	except Exception, e:		
		return False