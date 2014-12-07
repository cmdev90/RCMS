import json, random, services, datetime
from azure.storage import TableService, Entity
import sqlite3


account_name = 'rcms'     
account_key = '9L1kZqrgAovvt1KI3xOfRj6RxLPt+hWpAI2mfsJ3zpf6DjMCN/TqYcaCb956jYG8qELgWpv0T0Cn5OC4vCPOng=='
table = 'Usage'
priority = '200'

ts = TableService(account_name = account_name, account_key = account_key)
ts.create_table(table)
# ts.delete_table(table)	

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



def get_usages_by_app_agg(app_id, offset):

	list = []
	try:
		usage = get_usages_by_app(app_id)
		
		if usage is not None:

			for u in usage:

				s = str(u.RowKey)
				t = datetime.datetime.fromtimestamp(float(s)/1000.)
				fmt = "%Y-%m-%d %H:%M"
				now = datetime.datetime.now() - datetime.timedelta(minutes=int(offset))
				# print now.strftime(fmt)
				if t.strftime(fmt) >= now.strftime(fmt) :				
					u.timestamp = t.strftime(fmt)								
					list.append(u.__dict__)
			l2 = group_by(list)
			return l2		
	except Exception, e:
		return None			



def group_by(L):
	
	results = {}
	for item in L:

		key = (item["transmission"], item["event"], item["timestamp"])
		if key in results:  # combine them
			results[key] = {"PartitionKey": item["PartitionKey"], "RowKey": item["RowKey"], 
			"transmission": item["transmission"], "event": item["event"], 
			"timestamp": item["timestamp"], "length": int(item["length"]) + int(results[key]["length"])}
		else:  # don't need to combine them
			results[key] = item

	return results.values()
	
# print get_cost_and_requests(auth)