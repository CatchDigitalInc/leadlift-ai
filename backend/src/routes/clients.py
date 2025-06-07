from flask import Blueprint, request, jsonify
from ..models.user import Client, db
import secrets

clients_bp = Blueprint('clients', __name__)

@clients_bp.route('', methods=['GET'])
def get_clients():
    try:
        clients = Client.query.all()
        clients_data = []
        
        for client in clients:
            clients_data.append({
                'id': client.id,
                'name': client.name,
                'domain': client.domain,
                'industry': client.industry,
                'client_id': client.client_id,
                'created_at': client.created_at.isoformat(),
                'forms_count': 0,  # TODO: Count actual forms
                'submissions_count': 0  # TODO: Count actual submissions
            })
        
        return jsonify({'success': True, 'clients': clients_data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@clients_bp.route('', methods=['POST'])
def create_client():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('name') or not data.get('domain'):
            return jsonify({'success': False, 'error': 'Name and domain are required'}), 400
        
        # Generate unique client ID
        client_id = secrets.token_hex(4)
        while Client.query.filter_by(client_id=client_id).first():
            client_id = secrets.token_hex(4)
        
        # Create new client
        client = Client(
            name=data['name'],
            domain=data['domain'],
            industry=data.get('industry'),  # Optional industry field
            client_id=client_id
        )
        
        db.session.add(client)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'client': {
                'id': client.id,
                'name': client.name,
                'domain': client.domain,
                'industry': client.industry,
                'client_id': client.client_id,
                'created_at': client.created_at.isoformat(),
                'forms_count': 0,
                'submissions_count': 0
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@clients_bp.route('/<client_id>/tracking-script', methods=['GET'])
def get_tracking_script(client_id):
    try:
        client = Client.query.filter_by(client_id=client_id).first()
        if not client:
            return jsonify({'success': False, 'error': 'Client not found'}), 404
        
        # Generate enhanced tracking script with automatic form detection
        script = f"""
<!-- LeadLift.ai Tracking Script for {client.name} -->
<script>
(function() {{
    const CLIENT_ID = '{client.client_id}';
    const API_ENDPOINT = 'http://localhost:5000/api/submit/' + CLIENT_ID;
    
    // Function to get form identifier
    function getFormIdentifier(form) {{
        // Try to get a meaningful form name
        if (form.id) return form.id;
        if (form.name) return form.name;
        if (form.className) {{
            // Look for common form class patterns
            const classes = form.className.split(' ');
            for (let cls of classes) {{
                if (cls.includes('contact')) return 'contact-form';
                if (cls.includes('newsletter')) return 'newsletter-form';
                if (cls.includes('quote')) return 'quote-form';
                if (cls.includes('signup')) return 'signup-form';
                if (cls.includes('login')) return 'login-form';
                if (cls.includes('search')) return 'search-form';
            }}
        }}
        
        // Look for form purpose based on input fields
        const inputs = form.querySelectorAll('input[type="email"], input[name*="email"]');
        if (inputs.length > 0) {{
            const hasName = form.querySelector('input[name*="name"], input[name*="first"], input[name*="last"]');
            const hasPhone = form.querySelector('input[name*="phone"], input[type="tel"]');
            const hasMessage = form.querySelector('textarea, input[name*="message"], input[name*="comment"]');
            
            if (hasMessage) return 'contact-form';
            if (hasPhone && hasName) return 'lead-form';
            if (hasName) return 'signup-form';
            return 'email-form';
        }}
        
        // Fallback based on page URL
        const path = window.location.pathname.toLowerCase();
        if (path.includes('contact')) return 'contact-form';
        if (path.includes('quote')) return 'quote-form';
        if (path.includes('signup') || path.includes('register')) return 'signup-form';
        if (path.includes('newsletter')) return 'newsletter-form';
        
        // Final fallback
        return 'form-' + Array.from(document.forms).indexOf(form);
    }}
    
    // Function to extract all form field data
    function extractFormData(form) {{
        const formData = new FormData(form);
        const data = {{}};
        
        // Get all form fields
        for (let [key, value] of formData.entries()) {{
            data[key] = value;
        }}
        
        // Add form metadata
        data._form_id = getFormIdentifier(form);
        data._form_url = window.location.href;
        data._form_path = window.location.pathname;
        data._form_title = document.title;
        data._timestamp = new Date().toISOString();
        
        // Count form fields for complexity scoring
        const inputs = form.querySelectorAll('input:not([type="hidden"]), textarea, select');
        data._form_field_count = inputs.length;
        
        // Detect form type for better categorization
        const hasEmail = form.querySelector('input[type="email"], input[name*="email"]');
        const hasPhone = form.querySelector('input[type="tel"], input[name*="phone"]');
        const hasName = form.querySelector('input[name*="name"], input[name*="first"], input[name*="last"]');
        const hasMessage = form.querySelector('textarea, input[name*="message"]');
        const hasFile = form.querySelector('input[type="file"]');
        
        data._form_type = 'other';
        if (hasEmail && hasName && hasMessage) data._form_type = 'contact';
        else if (hasEmail && hasPhone && hasName) data._form_type = 'lead';
        else if (hasEmail && hasName) data._form_type = 'signup';
        else if (hasEmail && !hasName) data._form_type = 'newsletter';
        else if (hasFile) data._form_type = 'upload';
        
        return data;
    }}
    
    // Function to send form data to LeadLift API
    function sendToLeadLift(formData) {{
        // Add UTM and session data from your existing tracking
        formData.utm_source = localStorage.getItem('utm_source') || '';
        formData.utm_medium = localStorage.getItem('utm_medium') || '';
        formData.utm_campaign = localStorage.getItem('utm_campaign') || '';
        formData.utm_term = localStorage.getItem('utm_term') || '';
        formData.utm_content = localStorage.getItem('utm_content') || '';
        formData.utm_source_initial = localStorage.getItem('utm_source_initial') || '';
        formData.utm_medium_initial = localStorage.getItem('utm_medium_initial') || '';
        formData.utm_campaign_initial = localStorage.getItem('utm_campaign_initial') || '';
        
        // Session and engagement data
        formData.session_count = localStorage.getItem('session_count') || '1';
        formData.engaged_duration = localStorage.getItem('engaged_duration') || '0';
        formData.page_journey = localStorage.getItem('page_journey') || '';
        formData.pages_visited = localStorage.getItem('pages_visited') || '1';
        
        // Calculate lead score factors
        formData._lead_score_factors = {{
            session_count: parseInt(formData.session_count) || 1,
            engaged_duration: parseInt(formData.engaged_duration) || 0,
            pages_visited: parseInt(formData.pages_visited) || 1,
            has_utm_source: !!formData.utm_source,
            form_complexity: formData._form_field_count || 1
        }};
        
        fetch(API_ENDPOINT, {{
            method: 'POST',
            headers: {{
                'Content-Type': 'application/json',
            }},
            body: JSON.stringify(formData)
        }}).catch(err => console.log('LeadLift tracking error:', err));
    }}
    
    // Auto-register all existing forms
    function registerForms() {{
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {{
            // Skip if already registered
            if (form.dataset.leadliftRegistered) return;
            
            form.addEventListener('submit', function(e) {{
                try {{
                    const formData = extractFormData(form);
                    sendToLeadLift(formData);
                }} catch (err) {{
                    console.log('LeadLift form tracking error:', err);
                }}
            }});
            
            form.dataset.leadliftRegistered = 'true';
        }});
    }}
    
    // Register forms on page load
    if (document.readyState === 'loading') {{
        document.addEventListener('DOMContentLoaded', registerForms);
    }} else {{
        registerForms();
    }}
    
    // Watch for dynamically added forms
    const observer = new MutationObserver(function(mutations) {{
        mutations.forEach(function(mutation) {{
            mutation.addedNodes.forEach(function(node) {{
                if (node.nodeType === 1) {{ // Element node
                    if (node.tagName === 'FORM') {{
                        registerForms();
                    }} else if (node.querySelectorAll) {{
                        const forms = node.querySelectorAll('form');
                        if (forms.length > 0) registerForms();
                    }}
                }}
            }});
        }});
    }});
    
    observer.observe(document.body, {{
        childList: true,
        subtree: true
    }});
}})();
</script>"""
        
        return jsonify({'success': True, 'script': script})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@clients_bp.route('/industries', methods=['GET'])
def get_industries():
    """Get list of all industries for grouping"""
    try:
        industries = db.session.query(Client.industry).filter(Client.industry.isnot(None)).distinct().all()
        industry_list = [industry[0] for industry in industries if industry[0]]
        
        return jsonify({'success': True, 'industries': industry_list})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@clients_bp.route('/by-industry/<industry>', methods=['GET'])
def get_clients_by_industry(industry):
    """Get clients filtered by industry"""
    try:
        clients = Client.query.filter_by(industry=industry).all()
        clients_data = []
        
        for client in clients:
            clients_data.append({
                'id': client.id,
                'name': client.name,
                'domain': client.domain,
                'industry': client.industry,
                'client_id': client.client_id,
                'created_at': client.created_at.isoformat(),
                'forms_count': 0,  # TODO: Count actual forms
                'submissions_count': 0  # TODO: Count actual submissions
            })
        
        return jsonify({'success': True, 'clients': clients_data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

