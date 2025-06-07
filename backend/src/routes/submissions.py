from flask import Blueprint, request, jsonify
from ..models.user import Submission, Client, db
from datetime import datetime
import json

submissions_bp = Blueprint('submissions', __name__)

@submissions_bp.route('/<client_id>', methods=['POST'])
def capture_submission(client_id):
    """Capture form submission from tracking script"""
    try:
        # Verify client exists
        client = Client.query.filter_by(client_id=client_id).first()
        if not client:
            return jsonify({'success': False, 'error': 'Client not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        # Extract form metadata
        form_id = data.get('_form_id', 'unknown-form')
        form_type = data.get('_form_type', 'other')
        form_url = data.get('_form_url', '')
        form_path = data.get('_form_path', '')
        page_title = data.get('_form_title', '')
        
        # Extract contact information
        email = data.get('email') or data.get('Email') or data.get('EMAIL')
        name = (data.get('name') or data.get('Name') or data.get('first_name') or 
                data.get('firstName') or data.get('full_name') or data.get('fullName'))
        phone = (data.get('phone') or data.get('Phone') or data.get('telephone') or 
                 data.get('mobile') or data.get('cell'))
        
        # Calculate lead score
        lead_score_factors = data.get('_lead_score_factors', {})
        lead_score = calculate_lead_score(lead_score_factors, data)
        
        # Create submission record
        submission = Submission(
            client_id=client_id,
            form_name=form_id,  # Legacy compatibility
            form_id=form_id,
            form_type=form_type,
            form_url=form_url,
            form_path=form_path,
            page_title=page_title,
            email=email,
            name=name,
            phone=phone,
            
            # UTM Parameters
            initial_utm_source=data.get('utm_source_initial') or data.get('utm_source'),
            initial_utm_medium=data.get('utm_medium_initial') or data.get('utm_medium'),
            initial_utm_campaign=data.get('utm_campaign_initial') or data.get('utm_campaign'),
            initial_utm_term=data.get('utm_term_initial') or data.get('utm_term'),
            initial_utm_content=data.get('utm_content_initial') or data.get('utm_content'),
            
            recent_utm_source=data.get('utm_source'),
            recent_utm_medium=data.get('utm_medium'),
            recent_utm_campaign=data.get('utm_campaign'),
            recent_utm_term=data.get('utm_term'),
            recent_utm_content=data.get('utm_content'),
            
            # Engagement metrics
            session_count=int(data.get('session_count', 1)),
            engaged_session_duration=int(data.get('engaged_duration', 0)),
            pages_visited=int(data.get('pages_visited', 1)),
            page_journey=data.get('page_journey', ''),
            
            # Lead scoring
            lead_quality_score=lead_score,
            
            # Store all form data as JSON
            form_data=json.dumps({k: v for k, v in data.items() if not k.startswith('_')})
        )
        
        db.session.add(submission)
        db.session.commit()
        
        return jsonify({'success': True, 'submission_id': submission.id})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

def calculate_lead_score(factors, data):
    """Calculate lead quality score based on engagement and form data"""
    score = 0
    
    # Base score for having UTM source (indicates marketing attribution)
    if factors.get('has_utm_source'):
        score += 20
    
    # Session count scoring (returning visitors are higher quality)
    session_count = factors.get('session_count', 1)
    if session_count >= 5:
        score += 25
    elif session_count >= 3:
        score += 15
    elif session_count >= 2:
        score += 10
    else:
        score += 5
    
    # Engaged duration scoring (time spent on site)
    engaged_duration = factors.get('engaged_duration', 0)
    if engaged_duration >= 300:  # 5+ minutes
        score += 25
    elif engaged_duration >= 120:  # 2+ minutes
        score += 20
    elif engaged_duration >= 60:   # 1+ minute
        score += 15
    elif engaged_duration >= 30:   # 30+ seconds
        score += 10
    else:
        score += 5
    
    # Pages visited scoring (engagement depth)
    pages_visited = factors.get('pages_visited', 1)
    if pages_visited >= 5:
        score += 20
    elif pages_visited >= 3:
        score += 15
    elif pages_visited >= 2:
        score += 10
    else:
        score += 5
    
    # Form complexity scoring (more fields = higher intent)
    form_complexity = factors.get('form_complexity', 1)
    if form_complexity >= 8:
        score += 15
    elif form_complexity >= 5:
        score += 10
    elif form_complexity >= 3:
        score += 5
    
    # Contact information completeness
    if data.get('email'):
        score += 5
    if data.get('phone') or data.get('Phone'):
        score += 10  # Phone indicates higher intent
    if data.get('name') or data.get('Name'):
        score += 5
    
    # Cap at 100
    return min(score, 100)

@submissions_bp.route('/client/<client_id>', methods=['GET'])
def get_client_submissions(client_id):
    """Get all submissions for a specific client"""
    try:
        # Verify client exists
        client = Client.query.filter_by(client_id=client_id).first()
        if not client:
            return jsonify({'success': False, 'error': 'Client not found'}), 404
        
        # Get query parameters
        form_id = request.args.get('form_id')
        form_type = request.args.get('form_type')
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        limit = int(request.args.get('limit', 100))
        
        # Build query
        query = Submission.query.filter_by(client_id=client_id)
        
        if form_id:
            query = query.filter_by(form_id=form_id)
        if form_type:
            query = query.filter_by(form_type=form_type)
        if date_from:
            query = query.filter(Submission.submission_date >= datetime.fromisoformat(date_from))
        if date_to:
            query = query.filter(Submission.submission_date <= datetime.fromisoformat(date_to))
        
        submissions = query.order_by(Submission.submission_date.desc()).limit(limit).all()
        
        submissions_data = []
        for submission in submissions:
            submissions_data.append({
                'id': submission.id,
                'form_id': submission.form_id,
                'form_type': submission.form_type,
                'form_url': submission.form_url,
                'form_path': submission.form_path,
                'page_title': submission.page_title,
                'submission_date': submission.submission_date.isoformat(),
                'email': submission.email,
                'name': submission.name,
                'phone': submission.phone,
                'initial_utm_source': submission.initial_utm_source,
                'initial_utm_medium': submission.initial_utm_medium,
                'recent_utm_source': submission.recent_utm_source,
                'recent_utm_medium': submission.recent_utm_medium,
                'lead_quality_score': submission.lead_quality_score,
                'session_count': submission.session_count,
                'engaged_session_duration': submission.engaged_session_duration,
                'pages_visited': submission.pages_visited,
                'form_data': json.loads(submission.form_data) if submission.form_data else {}
            })
        
        return jsonify({'success': True, 'submissions': submissions_data})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@submissions_bp.route('/client/<client_id>/forms', methods=['GET'])
def get_client_forms(client_id):
    """Get list of all forms detected for a client"""
    try:
        # Verify client exists
        client = Client.query.filter_by(client_id=client_id).first()
        if not client:
            return jsonify({'success': False, 'error': 'Client not found'}), 404
        
        # Get unique forms with submission counts
        forms_query = db.session.query(
            Submission.form_id,
            Submission.form_type,
            db.func.count(Submission.id).label('submission_count'),
            db.func.max(Submission.submission_date).label('last_submission'),
            db.func.avg(Submission.lead_quality_score).label('avg_lead_score')
        ).filter_by(client_id=client_id).group_by(
            Submission.form_id, Submission.form_type
        ).all()
        
        forms_data = []
        for form in forms_query:
            forms_data.append({
                'form_id': form.form_id,
                'form_type': form.form_type,
                'submission_count': form.submission_count,
                'last_submission': form.last_submission.isoformat() if form.last_submission else None,
                'avg_lead_score': round(form.avg_lead_score, 1) if form.avg_lead_score else 0
            })
        
        return jsonify({'success': True, 'forms': forms_data})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@submissions_bp.route('/analytics/<client_id>', methods=['GET'])
def get_client_analytics(client_id):
    """Get analytics data for a specific client"""
    try:
        # Verify client exists
        client = Client.query.filter_by(client_id=client_id).first()
        if not client:
            return jsonify({'success': False, 'error': 'Client not found'}), 404
        
        # Get date range
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        
        query = Submission.query.filter_by(client_id=client_id)
        if date_from:
            query = query.filter(Submission.submission_date >= datetime.fromisoformat(date_from))
        if date_to:
            query = query.filter(Submission.submission_date <= datetime.fromisoformat(date_to))
        
        submissions = query.all()
        
        # Calculate analytics
        total_submissions = len(submissions)
        avg_lead_score = sum(s.lead_quality_score or 0 for s in submissions) / total_submissions if total_submissions > 0 else 0
        
        # Group by form
        form_analytics = {}
        for submission in submissions:
            form_id = submission.form_id or 'unknown'
            if form_id not in form_analytics:
                form_analytics[form_id] = {
                    'form_id': form_id,
                    'form_type': submission.form_type,
                    'submissions': 0,
                    'avg_score': 0,
                    'scores': []
                }
            form_analytics[form_id]['submissions'] += 1
            form_analytics[form_id]['scores'].append(submission.lead_quality_score or 0)
        
        # Calculate averages
        for form_data in form_analytics.values():
            form_data['avg_score'] = sum(form_data['scores']) / len(form_data['scores']) if form_data['scores'] else 0
            del form_data['scores']  # Remove raw scores from response
        
        # Group by UTM source
        source_analytics = {}
        for submission in submissions:
            source = submission.initial_utm_source or submission.recent_utm_source or 'Direct'
            if source not in source_analytics:
                source_analytics[source] = {'source': source, 'submissions': 0, 'avg_score': 0, 'scores': []}
            source_analytics[source]['submissions'] += 1
            source_analytics[source]['scores'].append(submission.lead_quality_score or 0)
        
        # Calculate source averages
        for source_data in source_analytics.values():
            source_data['avg_score'] = sum(source_data['scores']) / len(source_data['scores']) if source_data['scores'] else 0
            del source_data['scores']
        
        return jsonify({
            'success': True,
            'analytics': {
                'total_submissions': total_submissions,
                'avg_lead_score': round(avg_lead_score, 1),
                'forms': list(form_analytics.values()),
                'sources': list(source_analytics.values())
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

