from flask import Blueprint, request, jsonify
from src.models.user import db, Client, Form, Submission
import json
from datetime import datetime

forms_bp = Blueprint('forms', __name__)

@forms_bp.route('/clients/<client_id>/forms', methods=['GET'])
def get_client_forms(client_id):
    """Get all forms for a client"""
    try:
        client = Client.query.filter_by(client_id=client_id).first()
        if not client:
            return jsonify({'success': False, 'error': 'Client not found'}), 404
        
        forms = Form.query.filter_by(client_id=client_id).all()
        return jsonify({
            'success': True,
            'forms': [form.to_dict() for form in forms]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@forms_bp.route('/clients/<client_id>/forms', methods=['POST'])
def create_form(client_id):
    """Create a new form for a client"""
    try:
        client = Client.query.filter_by(client_id=client_id).first()
        if not client:
            return jsonify({'success': False, 'error': 'Client not found'}), 404
        
        data = request.get_json()
        if not data or not data.get('form_name'):
            return jsonify({'success': False, 'error': 'Form name is required'}), 400
        
        form = Form(
            client_id=client_id,
            form_name=data['form_name'],
            form_identifier=data.get('form_identifier', '')
        )
        
        db.session.add(form)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'form': form.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@forms_bp.route('/forms/<int:form_id>', methods=['PUT'])
def update_form(form_id):
    """Update a form"""
    try:
        form = Form.query.get(form_id)
        if not form:
            return jsonify({'success': False, 'error': 'Form not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        if 'form_name' in data:
            form.form_name = data['form_name']
        if 'form_identifier' in data:
            form.form_identifier = data['form_identifier']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'form': form.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@forms_bp.route('/forms/<int:form_id>', methods=['DELETE'])
def delete_form(form_id):
    """Delete a form"""
    try:
        form = Form.query.get(form_id)
        if not form:
            return jsonify({'success': False, 'error': 'Form not found'}), 404
        
        db.session.delete(form)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Form deleted successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

