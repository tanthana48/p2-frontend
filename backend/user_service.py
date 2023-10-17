from flask import Flask, request, jsonify
import jwt

app = Flask(__name__)

SECRET_KEY = 'your_secret_key'

users = []
def generate_token(user_id, roles=[]):
    payload = {'user_id': user_id, 'roles': roles}
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    return token

def validate_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return 'Token has expired'
    except jwt.InvalidTokenError:
        return 'Invalid token'
    
@app.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    if 'username' in data and 'password' in data:
        user = {
            'username': data['username'],
            'password': data['password'],
            'id': len(users) + 1,
            'roles': data.get('roles', [])
        }
        users.append(user)
        token = generate_token(user['id'], user['roles'])
        return jsonify({'token': token}), 201
    else:
        return jsonify({'error': 'Invalid user data'}), 400

@app.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()
    if 'username' in data and 'password' in data:
        user = next((u for u in users if u['username'] == data['username']), None)
        if user and user['password'] == data['password']:
            token = generate_token(user['id'], user['roles'])
            return jsonify({'token': token}), 200
    return jsonify({'error': 'Invalid credentials'}), 401


@app.route('/users', methods=['GET'])
def get_users():
    return jsonify({'users': users})

@app.route('/verify', methods=['POST'])
def verify_token():
    token = request.headers.get('Authorization')
    if token is None:
        return jsonify({'error': 'Token missing'}), 401
    payload = validate_token(token)
    if isinstance(payload, str):
        return jsonify({'error': payload}), 401
    return jsonify({'message': 'Token is valid'})
if __name__ == '__main__':
    app.run(debug=True)
