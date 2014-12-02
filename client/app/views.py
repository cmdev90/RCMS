from app import app
import os, datetime
from flask import jsonify, abort, make_response, request, url_for
from flask.ext.httpauth import HTTPBasicAuth
import table_services, services, json, hashlib, user_services, app_services



@app.route('/get/user/package/<partition>/<rowkey>', methods=['GET'])
def get_user_package(partition, rowkey):
	p = table_services.get_package(partition, rowkey)
	if p is not None:
		return jsonify({"package" : p}), 200
	else :
		return jsonify({"package" : {}}), 404


@app.route('/get/user/app/usage/<partition>', methods=['GET'])
def get_user_app_usage(partition):
	usage = app_services.get_usages_by_app(partition)
	list = []
	temp = 1
	if usage is not None:
		for u in usage:

			s = str(u.RowKey)
			t = datetime.datetime.fromtimestamp(float(s)/1000.)
			fmt = "%Y-%m-%d %H:%M:%S"
			u.timestamp = t.strftime(fmt)
			# if temp == 1:
			# 	u.transmission = "outgoing"
			# 	temp = 0
			# else :
			# 	temp = 1

			list.append(u.__dict__)

		return jsonify({"usage" : list}), 200
	else :
		return jsonify({"packages" : {}}), 404




@app.route('/get/all/packages', methods=['GET'])
def get_all_package():
	p = json.loads(services.packages)
	if p is not None:
		return jsonify(p), 200
	else :
		return jsonify({"packages" : {}}), 404	


@app.route('/get/all/locations', methods=['GET'])
def get_all_locations():
	l = json.loads(services.locations)
	if l is not None:		
		return jsonify(l), 200
	else :
		return jsonify({"locations" : {}}), 404				


@app.route('/update/user/package', methods=['POST'])
def update_user_package():
	if not request.json:
		abort(400)
	data = {
		"rowkey" 		: request.json['rowkey'],
		"partition" 	: request.json['partition'],
		"package_type" 	: request.json['package_type']			
	}	

	
	if table_services.update_user_package(data) :
		return jsonify({"response": "successful"}), 201
	else :
		return jsonify({"response" : "error updating package"}), 400	


@app.route('/get/user/applications/<partition>', methods=['GET'])
def get_user_applications(partition):
	a = table_services.getUserApps(partition)
	if a is not None:
		return jsonify({"applications" : a}), 200
	else :
		return jsonify({"applications" : {}}), 404


@app.route('/save/user/app', methods=['POST'])
def save_user_app():
	if not request.json:
		abort(404)
	app = {
		"partition" : request.json['partition'],
		"apptype"	: request.json['apptype'],
		"name"		: request.json['name'],
		"reigon"	: request.json['reigon']
	}
	count = table_services.saveApplication(app)

	if  count > -1:
		return jsonify({"response": "successful", "count" : count}), 201
	else :
		return jsonify({"response" : "error saving app"}), 400


@app.route('/delete/user/app/<partition>/<rowkey>', methods=['GET'])
def delete_user_app(partition, rowkey):

	count = table_services.delete_user_app(partition, rowkey)

	if  count > -1:
		return jsonify({"response": "successful", "count" : count}), 201
	else :
		return jsonify({"response" : "error saving app"}), 400


@app.route('/user/login', methods=['POST'])		
def user_login():
	if not request.json:
		abort(404)
	email = request.json['email']
	password = request.json['password']
	user = user_services.authenticate(email, password)

	if user is not None:
		return jsonify({"user" : user}), 200
	else :
		return jsonify({"user" : {}}), 404



@app.route('/create/user', methods=['POST'])
def create_user():
	if not request.json:
		abort(400)
	user = {		
		"password" 	: hashlib.sha1(request.json['password']).hexdigest(),
		"email" 	: request.json['email'],
		"firstname" : request.json['firstname'],
		"lastname" 	: request.json['lastname']
	}	
	# print user
	if user_services.createUser(user) :
		return jsonify({"response": "successful"}), 201
	else :
		return jsonify({"response" : "error creating user"}), 400



@app.route('/get/user/email/<email>', methods=['GET'])
def get_user_by_email(email):
	user = user_services.get_user_by_email(email)
	if user is not None:
		return jsonify({"user" : user.__dict__}), 200
	else :
		return jsonify({"user" : {}}), 404		