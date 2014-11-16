import json
from azure.storage import TableService, Entity


account_name = 'rcms'     
account_key = '9L1kZqrgAovvt1KI3xOfRj6RxLPt+hWpAI2mfsJ3zpf6DjMCN/TqYcaCb956jYG8qELgWpv0T0Cn5OC4vCPOng=='
table = 'users'
priority = '200'
json_data =	open('packages.json')

packages = json.dumps(json.load(json_data))

ts = TableService(account_name = account_name, account_key = account_key)
ts.create_table(table)

def users_to_json(user_list):

	list = []
	u = {}
	for user in user_list:
		u['user'] = user.__dict__
		list.append(u)
	return json.dumps(list, separators=(',',':'))

def createUser(new_user):
	user = Entity()
	user.PartitionKey = new_user["username"] #uiquely identifies a partition of entities 
	user.RowKey = new_user["password"] # row key will uniquely identify a particular entity
	user.email = new_user["email"]
	user.firstname = new_user["firstname"]
	user.lastname = new_user["lastname"]
	user.package = "free"
	user.nodes = "2"
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

def get_package(id):
    results = []

    def _decode_dict(a_dict):
        try: results.append(a_dict[id])
        except KeyError: pass
        return a_dict

    json.loads(packages, object_hook=_decode_dict)
    return results


def update_user_package(data):
	user = {"nodes" : data['nodes'], "package" : data['package']}
	try:
		ts.update_entity(table, data['username'], data['password'],user)
		return True
	except Exception, e:
		return False
	