import json
import datetime
from database import SessionLocal, init_db, Category, KBArticle, Ticket, Response, Feedback, AuditLog, SystemSetting
from ml_engine import ml_classifier

def seed_all():
    init_db()
    db = SessionLocal()

    # Clear existing data if needed or check if populated
    if db.query(Category).count() > 0:
        print("[Seed] Database already seeded.")
        db.close()
        return

    print("[Seed] Seeding Enterprise Knowledge Base and Categories...")

    # Seed Default System Settings
    db.add(SystemSetting(key="CONFIDENCE_THRESHOLD", value="0.85"))
    db.commit()

    # Seed Categories & KB Articles
    seed_kb_data = [
        {
            "category_name": "Account Access",
            "category_desc": "Issues related to login failures, password reset, MFA authentication, and SSO access.",
            "kb_title": "Self-Service Guide: Password Reset & SSO Authentication",
            "kb_content": """If you are unable to log in to your account or received an 'Access Denied / Invalid Credentials' error:

1. Resetting Your Password:
   - Visit https://auth.company.com/reset-password
   - Enter your registered enterprise email address.
   - Click the verification link sent to your inbox within 15 minutes.
   - Set a new password meeting security requirements (12+ characters, 1 uppercase, 1 symbol).

2. MFA / Multi-Factor Authentication Lockout:
   - Open your Authenticator app (Okta / Google Authenticator) and verify system clock sync.
   - If you lost your phone, enter your 16-digit Emergency Backup Code.
   - To register a new MFA device, contact the Helpdesk or submit a security token reset request.

3. Single Sign-On (SSO) Issues:
   - Clear browser cookies and cache (Ctrl+Shift+R).
   - Ensure your corporate VPN connection is active if accessing from a remote network."""
        },
        {
            "category_name": "Billing & Refunds",
            "category_desc": "Queries regarding subscription charges, invoices, payment methods, and refund requests.",
            "kb_title": "Billing FAQ: Invoices, Subscriptions & Refund Policy",
            "kb_content": """Here is how to manage billing, view receipts, or request a refund for your account:

1. Downloading Invoices & Receipts:
   - Go to Settings > Billing & Licenses in your admin dashboard.
   - Click 'Download PDF' next to the corresponding transaction statement.

2. Refund Policy & Processing:
   - Subscriptions cancelled within 14 days of billing are eligible for a 100% full refund.
   - Pro-rated refunds are automatically calculated and returned to your original payment method within 3-5 business days.

3. Updating Payment Method:
   - Navigate to Payment Methods > Add New Credit Card / Corporate ACH.
   - Ensure billing address matches your issuing bank records to prevent 3D-Secure transaction failures."""
        },
        {
            "category_name": "Technical & Infrastructure",
            "category_desc": "Software bugs, application crashes, API errors, 500 server errors, and system slowdowns.",
            "kb_title": "Troubleshooting Guide: System Outages, API Errors & Bug Reports",
            "kb_content": """If you encounter software bugs, application crashes, or API connection errors:

1. Checking System Status:
   - Check real-time service health at https://status.company.com
   - If an ongoing incident is listed, our DevOps team is actively resolving it.

2. API Rate Limits & Error Codes:
   - HTTP 429 (Too Many Requests): Reduce request frequency or implement exponential backoff.
   - HTTP 500 / 503: Temporary internal gateway error. Verify API payload schema and retry after 60 seconds.

3. Submitting Technical Logs:
   - Capture console error logs from browser inspect tools (F12 > Console tab).
   - Attach request ID (x-request-id header) to expedite senior engineering investigation."""
        },
        {
            "category_name": "HR & Leave Balance",
            "category_desc": "Inquiries regarding PTO vacation balance, sick leave policies, payroll, and time-off requests.",
            "kb_title": "HR Portal Guide: Vacation Balance, PTO Requests & Payroll",
            "kb_content": """How to check your leave entitlement and log PTO requests:

1. Viewing Leave Balance:
   - Log into Workday / HR Portal > Time Off & Leave.
   - Your current accrued Paid Time Off (PTO), Sick Leave, and Floating Holidays are displayed on your summary dashboard.

2. Submitting PTO / Leave Request:
   - Click 'Request Time Off' > Select Start and End Date.
   - Select leave type (Vacation, Sick, Parental, Bereavement).
   - Requests are automatically routed to your direct manager for digital approval.

3. Payroll & Direct Deposit Updates:
   - Direct deposit updates must be submitted 5 business days before pay period cutoff."""
        },
        {
            "category_name": "Security & Permissions",
            "category_desc": "Requests for elevated role privileges, admin permissions, VPN certificates, and compliance access.",
            "kb_title": "Security Protocol: Access Requests, Roles & Corporate VPN",
            "kb_content": """Procedure for requesting elevated permissions or security credentials:

1. Requesting Admin or Repository Access:
   - Access requests require manager endorsement and security compliance approval.
   - Submit your request via the Identity Governance portal (IDM) specifying business justification.

2. Corporate VPN Setup:
   - Download GlobalProtect / Cisco AnyConnect client from IT Software Portal.
   - Connect to vpn.company.com using SAML single sign-on credentials.
   - Ensure your device has active antivirus and disk encryption enabled."""
        }
    ]

    cat_map = {}
    for item in seed_kb_data:
        cat = Category(
            name=item["category_name"],
            description=item["category_desc"]
        )
        db.add(cat)
        db.commit()
        db.refresh(cat)

        kb = KBArticle(
            category_id=cat.id,
            title=item["kb_title"],
            content=item["kb_content"],
            embedding_vector=json.dumps(ml_classifier.compute_embedding(item["kb_content"]))
        )
        db.add(kb)
        db.commit()
        db.refresh(kb)
        
        cat_map[item["category_name"]] = cat.id

    # Seed Sample High-Confidence & Low-Confidence Tickets
    sample_tickets = [
        {
            "subject": "Forgot password and locked out of my account",
            "desc": "I tried logging into the portal this morning but entered my password wrong three times. Now it says account locked. Please help reset my credentials. Email: john.doe@company.com Phone: 555-019-2831",
            "cat": "Account Access",
            "confidence": 0.94,
            "status": "auto_resolved",
            "pii": True,
            "response": "Hello John,\n\nThank you for reaching out regarding your account lockout.\n\nYou can instantly reset your password at https://auth.company.com/reset-password. Enter your email and follow the verification steps.\n\nBest regards,\nAI Support Assistant",
            "created_ago_mins": 120
        },
        {
            "subject": "Invoice refund request for accidental double charge",
            "desc": "Our credit card 4532-1100-8899-0021 was charged twice for monthly subscription invoice #INV-9821. Please issue a refund for the duplicate charge of $299.",
            "cat": "Billing & Refunds",
            "confidence": 0.91,
            "status": "auto_resolved",
            "pii": True,
            "response": "Hello,\n\nWe have identified the duplicate transaction for invoice #INV-9821. Under our 14-day refund policy, a full refund of $299 has been initiated to your card ending in 0021.",
            "created_ago_mins": 90
        },
        {
            "subject": "Custom Webhook API throwing 403 Forbidden error on legacy server",
            "desc": "Our custom internal webhooks started failing with HTTP 403 Forbidden after the recent deployment. The API payload schema seems fine. Is there an updated IP whitelist or token policy?",
            "cat": "Technical & Infrastructure",
            "confidence": 0.72, # Low confidence -> goes to agent queue!
            "status": "pending_agent",
            "pii": False,
            "response": "AI Draft Response:\nBased on our Technical KB, HTTP 403 indicates permission or token expiration. Please verify API headers and request ID x-request-id.",
            "created_ago_mins": 45
        },
        {
            "subject": "How many days of PTO vacation balance do I have left for December?",
            "desc": "Hi team, I want to check my remaining vacation leave balance before planning my holiday trip. Where can I see this?",
            "cat": "HR & Leave Balance",
            "confidence": 0.96,
            "status": "auto_resolved",
            "pii": False,
            "response": "Hi there,\n\nYou can view your remaining PTO and vacation balance by logging into Workday HR Portal > Time Off & Leave dashboard.\n\nBest regards,\nAI Support System",
            "created_ago_mins": 30
        },
        {
            "subject": "Need temporary admin access to AWS production database cluster for security audit",
            "desc": "We are conducting a PCI-DSS compliance audit today and need 4 hours of elevated read-write permissions on the prod DB cluster.",
            "cat": "Security & Permissions",
            "confidence": 0.68, # Low confidence -> goes to agent queue!
            "status": "pending_agent",
            "pii": False,
            "response": "AI Draft Response:\nElevated role privileges require manager approval. Please submit an IDM access ticket specifying your business justification.",
            "created_ago_mins": 15
        }
    ]

    for t_data in sample_tickets:
        cat_id = cat_map.get(t_data["cat"])
        created_time = datetime.datetime.utcnow() - datetime.timedelta(minutes=t_data["created_ago_mins"])
        
        t = Ticket(
            user_id="usr_emp_" + str(hash(t_data["subject"]) % 1000),
            user_email="user@enterprise.com",
            subject=t_data["subject"],
            description=t_data["desc"],
            sanitized_description=t_data["desc"],
            category_id=cat_id,
            confidence_score=t_data["confidence"],
            status=t_data["status"],
            pii_detected=t_data["pii"],
            created_at=created_time
        )
        db.add(t)
        db.commit()
        db.refresh(t)

        resp = Response(
            ticket_id=t.id,
            response_text=t_data["response"],
            generated_by="ai_auto" if t_data["status"] == "auto_resolved" else "ai_draft_agent_edited",
            sent_at=created_time
        )
        db.add(resp)

        fb = Feedback(
            ticket_id=t.id,
            was_edited=False if t_data["status"] == "auto_resolved" else True,
            rating=5 if t_data["status"] == "auto_resolved" else 4,
            comment="Instant and clear answer!" if t_data["status"] == "auto_resolved" else "Draft was helpful."
        )
        db.add(fb)

        audit = AuditLog(
            ticket_id=t.id,
            model_version="v1.0.0-hybrid",
            confidence_score=t_data["confidence"],
            pii_redacted_count=2 if t_data["pii"] else 0,
            action="auto_resolved" if t_data["status"] == "auto_resolved" else "routed_to_agent",
            details=f"Classification score {t_data['confidence']} vs threshold 0.85",
            timestamp=created_time
        )
        db.add(audit)

    db.commit()
    print("[Seed] Successfully seeded 5 Categories, 5 KB Articles, and 5 Sample Tickets!")
    db.close()

if __name__ == "__main__":
    seed_all()
