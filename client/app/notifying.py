import requests, json


url = 'http://rcms-cloud.herokuapp.com/user/login'
payload = {'email':'john@mail.com', 'password':'password'}
headers = {'content-type': 'application/json'}

r = requests.post(url, data=json.dumps(payload), headers=headers)

print r.text