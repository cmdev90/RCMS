from app import app
import os
from flask import jsonify, abort, make_response, request, url_for
from flask.ext.httpauth import HTTPBasicAuth
import table_services, services, json, hashlib


@app.route('/get/user/email/<email>', methods=['GET'])
def get_user_by_email(email):
	user = table_services.get_user_by_email(email)
	if user is not None:
		return jsonify({"user" : user}), 200
	else :
		return jsonify({"user" : {}}), 404



@app.route('/get/user/package/<package>', methods=['GET'])
def get_user_package(package):
	p = services.get_package(package)
	if p is not None:
		return jsonify({"package" : p}), 200
	else :
		return jsonify({"package" : {}}), 404


@app.route('/get/all/packages', methods=['GET'])
def get_all_package():
	p = json.loads(services.packages)
	if p is not None:
		return jsonify(p), 200
	else :
		return jsonify({"packages" : {}}), 404		



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
	print user
	if table_services.createUser(user) :
		return jsonify({"response": "successful"}), 201
	else :
		return jsonify({"response" : "error creating user"}), 400


@app.route('/update/user/package', methods=['POST'])
def update_user_package():
	if not request.json:
		abort(400)
	data = {
		"email" 	: request.json['email'],
		"password" 	: request.json['password'],
		"package" 	: request.json['package']			
	}	

	
	if table_services.update_user_package(data) :
		return jsonify({"response": "successful"}), 201
	else :
		return jsonify({"response" : "error updating package"}), 400	



@app.route('/user/login', methods=['POST'])		
def user_login():
	if not request.json:
		abort(404)
	email = request.json['email']
	password = request.json['password']
	user = table_services.authenticate(email, password)
	if user is not None:
		return jsonify({"user" : user}), 200
	else :
		return jsonify({"user" : {}}), 404
