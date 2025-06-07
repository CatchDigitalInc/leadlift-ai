from flask import Blueprint, request, jsonify, session
from models.user import db, User, Client
from werkzeug.security import generate_password_hash
from datetime import datetime
import re

users_bp = Blueprint('users', __name__)

def require_auth(f):
    """Decorator to require authentication"""
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

def require_permission(permission):
    """Decorator to require specific permission"""
    def decorator(f):
        def decorated_function(*args, **kwargs):
            if 'user_id' not in session:
                return jsonify({'success': False, 'error': 'Authentication required'}), 401
            
            user = User.query.get(session['user_id'])
            if not user or not user.has_permission(permission):
                return jsonify({'success': False, 'error': 'Insufficient permissions'}), 403
            
            return f(*args, **kwargs)
        decorated_function.__name__ = f.__name__
        return decorated_function
    return decorator

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    return True, "Password is valid"

@users_bp.route('/users', methods=['GET'])
@require_permission('create_users')
def get_users():
    """Get all users (admin/manager only)"""
    try:
        users = User.query.all()
        return jsonify({
            'success': True,
            'users': [user.to_dict() for user in users]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@users_bp.route('/users', methods=['POST'])
@require_permission('create_users')
def create_user():
    """Create a new user (admin/manager only)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['username', 'email', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if not data or not data.get(field):
                return jsonify({'success': False, 'error': f'{field} is required'}), 400
        
        # Validate email format
        if not validate_email(data['email']):
            return jsonify({'success': False, 'error': 'Invalid email format'}), 400
        
        # Validate password strength
        is_valid, message = validate_password(data['password'])
        if not is_valid:
            return jsonify({'success': False, 'error': message}), 400
        
        # Check if username or email already exists
        existing_user = User.query.filter(
            (User.username == data['username']) | (User.email == data['email'])
        ).first()
        
        if existing_user:
            return jsonify({'success': False, 'error': 'Username or email already exists'}), 400
        
        # Validate role
        valid_roles = ['admin', 'manager', 'user']
        role = data.get('role', 'user')
        if role not in valid_roles:
            return jsonify({'success': False, 'error': 'Invalid role'}), 400
        
        # Only admins can create other admins
        current_user = User.query.get(session['user_id'])
        if role == 'admin' and current_user.role != 'admin':
            return jsonify({'success': False, 'error': 'Only admins can create admin users'}), 403
        
        # Create new user
        user = User(
            username=data['username'],
            email=data['email'],
            password_hash=generate_password_hash(data['password']),
            first_name=data['first_name'],
            last_name=data['last_name'],
            role=role,
            created_by=session['user_id']
        )
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'user': user.to_dict(),
            'message': 'User created successfully'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@users_bp.route('/users/<int:user_id>', methods=['GET'])
@require_auth
def get_user(user_id):
    """Get a specific user"""
    try:
        current_user = User.query.get(session['user_id'])
        
        # Users can only view their own profile unless they're admin/manager
        if user_id != current_user.id and not current_user.has_permission('create_users'):
            return jsonify({'success': False, 'error': 'Insufficient permissions'}), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        return jsonify({
            'success': True,
            'user': user.to_dict()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@users_bp.route('/users/<int:user_id>', methods=['PUT'])
@require_auth
def update_user(user_id):
    """Update a user"""
    try:
        current_user = User.query.get(session['user_id'])
        target_user = User.query.get(user_id)
        
        if not target_user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        # Users can only update their own profile unless they're admin/manager
        if user_id != current_user.id and not current_user.has_permission('create_users'):
            return jsonify({'success': False, 'error': 'Insufficient permissions'}), 403
        
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        # Update allowed fields
        if 'first_name' in data:
            target_user.first_name = data['first_name']
        if 'last_name' in data:
            target_user.last_name = data['last_name']
        if 'email' in data:
            if not validate_email(data['email']):
                return jsonify({'success': False, 'error': 'Invalid email format'}), 400
            # Check if email is already taken by another user
            existing = User.query.filter(User.email == data['email'], User.id != user_id).first()
            if existing:
                return jsonify({'success': False, 'error': 'Email already exists'}), 400
            target_user.email = data['email']
        
        # Only admins/managers can update roles and active status
        if current_user.has_permission('create_users'):
            if 'role' in data:
                valid_roles = ['admin', 'manager', 'user']
                if data['role'] not in valid_roles:
                    return jsonify({'success': False, 'error': 'Invalid role'}), 400
                # Only admins can create other admins
                if data['role'] == 'admin' and current_user.role != 'admin':
                    return jsonify({'success': False, 'error': 'Only admins can assign admin role'}), 403
                target_user.role = data['role']
            
            if 'is_active' in data:
                target_user.is_active = bool(data['is_active'])
        
        target_user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'user': target_user.to_dict(),
            'message': 'User updated successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@users_bp.route('/users/<int:user_id>', methods=['DELETE'])
@require_permission('delete_users')
def delete_user(user_id):
    """Delete a user (admin only)"""
    try:
        current_user = User.query.get(session['user_id'])
        target_user = User.query.get(user_id)
        
        if not target_user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        # Can't delete yourself
        if user_id == current_user.id:
            return jsonify({'success': False, 'error': 'Cannot delete your own account'}), 400
        
        # Only admins can delete other admins
        if target_user.role == 'admin' and current_user.role != 'admin':
            return jsonify({'success': False, 'error': 'Only admins can delete admin users'}), 403
        
        db.session.delete(target_user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'User deleted successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

