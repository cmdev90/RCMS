
import requests, json

headers = {'content-type': 'application/json'}

def notify_client(url, payload):
	try:
		r = requests.post(url, data=json.dumps(payload), headers=headers)
		if len(str(r.text)) > 16:
			return True
	except Exception, e:
		print e
		return False
