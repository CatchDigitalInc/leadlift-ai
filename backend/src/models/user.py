from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class Client(db.Model):
    __tablename__ = 'clients'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    domain = db.Column(db.String(255), nullable=False)
    industry = db.Column(db.String(100))  # Industry for grouping and benchmarking
    client_id = db.Column(db.String(50), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    forms = db.relationship('Form', backref='client', lazy=True, cascade='all, delete-orphan')
    submissions = db.relationship('Submission', backref='client', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'domain': self.domain,
            'client_id': self.client_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'forms_count': len(self.forms),
            'submissions_count': len(self.submissions)
        }

class Form(db.Model):
    __tablename__ = 'forms'
    
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.String(50), db.ForeignKey('clients.client_id'), nullable=False)
    form_name = db.Column(db.String(255), nullable=False)
    form_identifier = db.Column(db.String(255))  # CSS selector or form ID
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    submissions = db.relationship('Submission', backref='form_ref', lazy=True, 
                                foreign_keys='Submission.form_name',
                                primaryjoin='Form.form_name == Submission.form_name')
    
    def to_dict(self):
        return {
            'id': self.id,
            'client_id': self.client_id,
            'form_name': self.form_name,
            'form_identifier': self.form_identifier,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'submissions_count': len(self.submissions)
        }

class Submission(db.Model):
    __tablename__ = 'submissions'
    
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.String(50), db.ForeignKey('clients.client_id'), nullable=False)
    form_name = db.Column(db.String(255))  # Legacy field
    form_id = db.Column(db.String(255))  # Auto-detected form identifier
    form_type = db.Column(db.String(100))  # contact, lead, signup, newsletter, etc.
    form_url = db.Column(db.String(500))  # Full URL where form was submitted
    form_path = db.Column(db.String(255))  # URL path
    page_title = db.Column(db.String(500))  # Page title when submitted
    submission_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Contact Information
    email = db.Column(db.String(255))
    name = db.Column(db.String(255))
    phone = db.Column(db.String(50))
    
    # Initial UTM Parameters (first-touch)
    initial_utm_source = db.Column(db.String(255))
    initial_utm_medium = db.Column(db.String(255))
    initial_utm_campaign = db.Column(db.String(255))
    initial_utm_term = db.Column(db.String(255))
    initial_utm_content = db.Column(db.String(255))
    
    # Recent UTM Parameters (latest session)
    recent_utm_source = db.Column(db.String(255))
    recent_utm_medium = db.Column(db.String(255))
    recent_utm_campaign = db.Column(db.String(255))
    recent_utm_term = db.Column(db.String(255))
    recent_utm_content = db.Column(db.String(255))
    
    # Engagement Metrics
    engaged_session_duration_seconds = db.Column(db.Integer)
    page_journey = db.Column(db.Text)
    session_count = db.Column(db.Integer)
    
    # Lead Scoring
    lead_quality_score = db.Column(db.Numeric(5, 2))
    
    # Additional Form Data (JSON for flexibility)
    additional_data = db.Column(db.Text)  # JSON string for custom form fields
    
    def to_dict(self):
        additional_data_parsed = None
        if self.additional_data:
            try:
                additional_data_parsed = json.loads(self.additional_data)
            except json.JSONDecodeError:
                additional_data_parsed = {}
        
        return {
            'id': self.id,
            'client_id': self.client_id,
            'form_name': self.form_name,
            'submission_date': self.submission_date.isoformat() if self.submission_date else None,
            'email': self.email,
            'name': self.name,
            'phone': self.phone,
            'initial_utm_source': self.initial_utm_source,
            'initial_utm_medium': self.initial_utm_medium,
            'initial_utm_campaign': self.initial_utm_campaign,
            'initial_utm_term': self.initial_utm_term,
            'initial_utm_content': self.initial_utm_content,
            'recent_utm_source': self.recent_utm_source,
            'recent_utm_medium': self.recent_utm_medium,
            'recent_utm_campaign': self.recent_utm_campaign,
            'recent_utm_term': self.recent_utm_term,
            'recent_utm_content': self.recent_utm_content,
            'engaged_session_duration_seconds': self.engaged_session_duration_seconds,
            'page_journey': self.page_journey,
            'session_count': self.session_count,
            'lead_quality_score': float(self.lead_quality_score) if self.lead_quality_score else None,
            'additional_data': additional_data_parsed
        }

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    role = db.Column(db.String(50), default='user')  # 'admin', 'manager', 'user'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))

    def __repr__(self):
        return f'<User {self.username}>'

    def to_dict(self, include_sensitive=False):
        data = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'is_active': self.is_active,
            'created_by': self.created_by
        }
        
        if include_sensitive:
            data['password_hash'] = self.password_hash
            
        return data
    
    def has_permission(self, permission):
        """Check if user has specific permission based on role"""
        permissions = {
            'admin': ['create_users', 'delete_users', 'manage_clients', 'view_analytics', 'manage_settings'],
            'manager': ['manage_clients', 'view_analytics', 'create_users'],
            'user': ['view_analytics']
        }
        return permission in permissions.get(self.role, [])
    
    def can_access_client(self, client_id):
        """Check if user can access specific client data"""
        # Admins and managers can access all clients
        if self.role in ['admin', 'manager']:
            return True
        # Regular users can access all clients for now
        # In the future, you could add client-specific permissions
        return True

