
import requests, json

headers = {'content-type': 'application/json'}

def notify_client(url, payload):
	try:
		r = requests.post(url, data=json.dumps(payload), headers=headers)		
		print payload['status']
		print r.text
		return True
	except Exception, e:
		print e
		return False
