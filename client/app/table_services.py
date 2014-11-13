from azure.storage import TableService, Entity
import json


account_name = 'rcms'     
account_key = '9L1kZqrgAovvt1KI3xOfRj6RxLPt+hWpAI2mfsJ3zpf6DjMCN/TqYcaCb956jYG8qELgWpv0T0Cn5OC4vCPOng=='
table = 'users'
priority = '200'

table_service = TableService(account_name = account_name, account_key = account_key)
table_service.create_table(table)

def users_to_json(user_list):

	list = []
	u = {}
	for user in user_list:
		u['user'] = user.__dict__
		list.append(u)
	return json.dumps(list, separators=(',',':'))

def createUser(username, password):
	user = Entity()
	user.PartitionKey = username
	user.RowKey = password
	user.priority = priority


	try:
		table_service.insert_entity(table,user)
		return True
	except Exception, e:
		return False


def get_user_by_username(username):
	try:
		user = table_service.query_entities(table, "PartitionKey eq '"+username+"'")
		return users_to_json(user)
	except Exception, e:
		return None


def authenticate(username, password):
	try:
		user = table_service.get_entity(table, username, password)
		return json.dumps(user.__dict__)
	except Exception, e:
		return None	