from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps

from flask import Blueprint, request, jsonify
from datetime import timedelta, datetime
from app import db
from app.models import User, Admin

auth = Blueprint("auth", __name__, url_prefix='/api/auth')
SECRET_KEY = 'SECRET_KEY'

# Create a function to generate tokens
def generate_token(user_id):
    payload = {
        'exp': datetime.now() + timedelta(days=10),
        'iat': datetime.now(),
        'sub': user_id
    }
    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm='HS256'
    )


# For routes that require authentication
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Check if token is in headers
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split('Bearer ')[1]

        if not token:
            return jsonify({'error': 'Token is missing'}), 401

        try:
            # Decode token
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            current_user = User.query.get(data['sub'])
        except:
            return jsonify({'error': 'Token is invalid'}), 401

        return f(current_user, *args, **kwargs)

    return decorated


# Registration endpoint
@auth.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    # Check if email already exists
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({'error': 'Email already exists'}), 400

    # Create new user
    try:
        hashed_password = generate_password_hash(data['pwd'])
        user = User(
            user_name=data['user_name'],
            email=data['email'],
            pwd=hashed_password,
            role_id=data['role_id']
        )
        db.session.add(user)
        db.session.commit()

        # If user has admin role, add to Admin table
        if user.role_id == 1:
            admin = Admin(user_id=user.id)
            db.session.add(admin)
            db.session.commit()

        return jsonify({
            'message': 'User registered successfully',
            'user': {
                'id': user.id,
                'user_name': user.user_name,
                'email': user.email,
                'role_id': user.role_id
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    # Find the user by email
    user = User.query.filter_by(email=data['email']).first()

    # Check if user exists and password is correct
    if not user or not check_password_hash(user.pwd, data['pwd']):
        return jsonify({'error': 'Invalid email or password'}), 401

    # Generate token
    token = generate_token(user.id)

    # Check if user is an admin
    is_admin = False
    admin = Admin.query.filter_by(user_id=user.id).first()
    if admin:
        is_admin = True

    if admin or user.role.id == 1:
        is_admin = True

    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': {
            'id': user.id,
            'user_name': user.user_name,
            'email': user.email,
            'role_id': user.role_id,
            'isAdmin': is_admin,
            'created_at': user.created_at
        }
    })


# Get user profile
@auth.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    # Check if user is an admin
    is_admin = False
    admin = Admin.query.filter_by(user_id=current_user.id).first()
    if admin:
        is_admin = True

    return jsonify({
        'id': current_user.id,
        'user_name': current_user.user_name,
        'email': current_user.email,
        'role_id': current_user.role_id,
        'isAdmin': is_admin,
        'created_at': current_user.created_at
    })
