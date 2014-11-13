from flask import Flask, jsonify, abort, make_response, request, url_for
from flask.ext.httpauth import HTTPBasicAuth
import table_services

app = Flask(__name__, static_url_path = "")



@app.route('/get/user/username/<username>', methods=['GET'])
def get_user_by_username(username):
	user = table_services.get_user_by_username(username)
	if user is not None:
		return jsonify({"user" : user}), 200
	else :
		return jsonify({"user" : {}}), 404


@app.route('/create/user', methods=['POST'])
def create_user():
	if not request.json:
		abort(400)
	username = request.json['username']
	password = request.json['password']
	if table_services.createUser(username, password) :
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


if __name__ == '__main__':
	app.run(debug=True)