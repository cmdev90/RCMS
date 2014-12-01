import random, json


json_data =	open('packages.json')
packages = json.dumps(json.load(json_data))
location_json = open('locations.json')
locations = json.dumps(json.load(location_json))

package_free = "free"
package_basic = "basic"
package_premium = "premium"
package_enterprise = "enterprise"
counter = 4000


# print locations

def get_package(id):
    results = []

    def _decode_dict(a_dict):
        try: results.append(a_dict[id])
        except KeyError: pass
        return a_dict

    json.loads(packages, object_hook=_decode_dict)
    return results


def list_to_json(list):

	list = []
	l = {}
	for l in list:
		l['obj'] = obj.__dict__
		list.append(l)
	return json.dumps(list, separators=(',',':'))

def get_port():
  global counter
  counter += 1
  return counter

def uniqueid():
    seed = random.getrandbits(32)
    while True:
       yield seed
       seed += 1