from app import app
import os
from flask import jsonify, abort, make_response, request, url_for
from flask.ext.httpauth import HTTPBasicAuth
import table_services, services, json


@app.route('/get/user/username/<username>', methods=['GET'])
def get_user_by_username(username):
	user = table_services.get_user_by_username(username)
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
		"username" 	: request.json['username'],
		"password" 	: request.json['password'],
		"email" 	: request.json['email'],
		"firstname" : request.json['firstname'],
		"lastname" 	: request.json['lastname']
	}	
	
	if table_services.createUser(user) :
		return jsonify({"response": "successful"}), 201
	else :
		return jsonify({"response" : "error creating user"}), 400


@app.route('/update/user/package', methods=['POST'])
def update_user_package():
	if not request.json:
		abort(400)
	data = {
		"username" 	: request.json['username'],
		"password" 	: request.json['password'],
		"package" 	: request.json['package']			
	}	
	
	if table_services.update_user_package(data) :
		return jsonify({"response": "successful"}), 201
	else :
		return jsonify({"response" : "error creating user"}), 400	



@app.route('/user/login', methods=['POST'])		
def user_login():
	if not request.json:
		abort(404)
	username = request.json['username']
	password = request.json['password']
	user = table_services.authenticate(username, password)
	if user is not None:
		return jsonify({"user" : user}), 200
	else :
		return jsonify({"user" : {}}), 404
