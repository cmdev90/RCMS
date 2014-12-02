import json, random, services
from azure.storage import TableService, Entity


account_name = 'rcms'     
account_key = '9L1kZqrgAovvt1KI3xOfRj6RxLPt+hWpAI2mfsJ3zpf6DjMCN/TqYcaCb956jYG8qELgWpv0T0Cn5OC4vCPOng=='
table = 'Usage'
priority = '200'

ts = TableService(account_name = account_name, account_key = account_key)
ts.create_table(table)

auth = 'kjlhajkdlhfjhasdnfasdkjflnasdf'


def get_usages_by_app(app_id):
	
	try:
		usage = ts.query_entities(table, "PartitionKey eq '"+app_id+"'")	
		return usage		
	except Exception, e:
		return None	

def get_cost_and_requests(app_id):

	apps = get_usages_by_app(app_id)
	if apps is not None:
		cost = 0
		requests = 0
		for u in apps:
			cost += int(u.length)
			requests +=1
		data = {
			"cost" 		: str((cost * 0.002) * 0.001),
			"requests" 	: str(requests)
		}
		return data
	else : 
		return None


# print get_cost_and_requests(auth)