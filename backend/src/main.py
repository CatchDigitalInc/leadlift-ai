import os
import sys
# DON'T CHANGE THIS PATH
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from models.user import db, User, Client, Form, Submission

# Load environment variables
load_dotenv()

# Import all the route blueprints
from routes.auth import auth_bp
from routes.users import users_bp  
from routes.clients import clients_bp
from routes.forms import forms_bp
from routes.submissions import submissions_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'asdf#FGSgvasgf$5$WGT')

# Get frontend URL from environment
frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')

# Enable CORS for all routes with environment-based origins
CORS(app, 
     supports_credentials=True,
     origins=['http://localhost:5173', 'http://localhost:3000', 'https://*.vercel.app'],
     allow_headers=['Content-Type', 'Authorization'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(users_bp, url_prefix='/api')
app.register_blueprint(clients_bp, url_prefix='/api')
app.register_blueprint(forms_bp, url_prefix='/api')
app.register_blueprint(submissions_bp, url_prefix='/api')

# Database configuration - using SQLite for development
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///lead_tracking.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Create tables and default admin user
with app.app_context():
    db.create_all()
    
    # Create default admin user if none exists
    from models.user import User
    from werkzeug.security import generate_password_hash
    
    admin_user = User.query.filter_by(role='admin').first()
    if not admin_user:
        default_admin = User(
            username='admin',
            email='admin@leadlift.ai',
            password_hash=generate_password_hash('admin123'),
            first_name='Admin',
            last_name='User',
            role='admin',
            is_active=True
        )
        db.session.add(default_admin)
        db.session.commit()
        print("Created default admin user: admin / admin123")

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

@app.route('/api/health', methods=['GET'])
def health_check():
    return {'status': 'healthy', 'message': 'LeadLift.ai API is running'}

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
