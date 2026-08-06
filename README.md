# ⚡ Enterprise AI Support Ticket Classification & Auto-Response System

An enterprise-grade, high-reliability AI platform built according to the **Product Master Document (PRD & TRD)**. It ingests support tickets, redacts sensitive PII, calculates vector embeddings, classifies ticket intent with calibrated confidence scores, executes RAG (Retrieval-Augmented Generation) against a Knowledge Base, automatically resolves high-confidence tickets, and routes edge cases to a human support agent triage desk.

---

## 🌟 Key Features & Highlights

1. **Dual ML & Cloud LLM Engine**:
   - **Zero-Dependency Smart Fallback**: Runs out-of-the-box using built-in TF-IDF / Cosine Similarity vectorizers & calibrated intent classifiers.
   - **Cloud LLM Integration**: Optionally plug in `GEMINI_API_KEY` or `OPENAI_API_KEY` in `.env` for generative cloud RAG responses.

2. **Dynamic Confidence Thresholding**:
   - High Confidence ($\ge 85\%$ by default): Instant automated response & auto-resolution chip sent to customer.
   - Low Confidence ($< 85\%$): Automated routing to human support agent triage queue with pre-populated AI response draft & source KB links.
   - Configurable dynamically from the **Admin KB & Settings** UI panel.

3. **Enterprise Security & PII Redaction**:
   - Strips email addresses, phone numbers, credit cards, SSNs, IP addresses, and API keys before passing ticket text to LLM inference or storing audit trails.

4. **Multi-Role User Interfaces**:
   - **End-User Portal**: Ticket submission with quick test prompts, real-time resolution chips, and CSAT rating modal.
   - **Support Agent Console**: Split-pane triage desk with ticket queue sorted by confidence, PII audit view, editable response draft, and category re-assignment selector.
   - **Admin KB Studio**: Dynamic threshold slider, category manager, and Knowledge Base article editor with automatic vector re-indexing.
   - **AI Analytics Studio**: Real-time auto-resolution rate, classification accuracy, response latency, and category performance matrix.

---

## 📁 Repository Structure

```
Ai ticket/
├── backend/
│   ├── config.py           # App configuration & environment settings
│   ├── database.py         # SQLAlchemy ORM models (tickets, categories, kb_articles, responses, audit_logs)
│   ├── pii_sanitizer.py    # Regex & NLP PII redaction engine
│   ├── ml_engine.py        # Intent classification model & vector embedding service
│   ├── rag_engine.py       # Knowledge retrieval & LLM/local RAG response generator
│   ├── seed_data.py        # Database pre-population with enterprise KB articles & sample tickets
│   ├── main.py             # FastAPI REST endpoints & CORS middleware
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── index.html          # HTML entry point
│   ├── vite.config.js      # Vite dev server configuration
│   ├── package.json        # React & UI dependencies
│   └── src/
│       ├── App.jsx         # Layout & view switcher
│       ├── index.css       # Glassmorphism design system & utility CSS
│       ├── components/
│       │   ├── Header.jsx          # Top navigation & system mode indicators
│       │   ├── UserPortal.jsx      # End-user ticket submission & instant response view
│       │   ├── AgentConsole.jsx    # Triage desk split-view review queue
│       │   ├── AdminKBManager.jsx  # Category manager & dynamic threshold settings
│       │   └── AnalyticsStudio.jsx # Executive AI metrics & accuracy matrix
│       └── services/
│           └── api.js              # REST client with standalone browser fallback
├── run_backend.py          # Uvicorn backend server launcher
├── .env.example            # Environment variables template
└── README.md               # System documentation
```

---

## 🚀 How to Run the System

### 1. Start the Backend API (FastAPI)

```bash
# Navigate to project directory
cd "c:/Users/acer/Desktop/Ai ticket"

# Install Python requirements
pip install -r backend/requirements.txt

# Run FastAPI backend server (starts on http://127.0.0.1:8000)
python run_backend.py
```

*Swagger / OpenAPI interactive API documentation will be available at:* `http://127.0.0.1:8000/docs`

---

### 2. Start the Frontend Dashboard (React + Vite)

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Launch Vite dev server
npm run dev
```

*Open your browser and navigate to:* `http://localhost:3000`

---

## 🔑 Optional Cloud LLM Setup

To use Google Gemini or OpenAI for generative response drafting, copy `.env.example` to `.env` and add your API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
# OR
OPENAI_API_KEY=your_openai_api_key_here

CONFIDENCE_THRESHOLD=0.85
```

If no key is specified, the system **automatically uses the built-in local smart RAG engine** so the application operates with 100% reliability offline!

---

## 🧪 Verification & Testing Workflows

1. **Submit High-Confidence Ticket**:
   - Go to **Submit Ticket** tab -> Click sample prompt **"Account Lockout"** -> Click **Submit Ticket**.
   - **Expected Outcome**: Instant `⚡ Instant Resolution` chip with 94% confidence, auto-resolved status, and password reset KB guide.

2. **Submit Low-Confidence Ticket**:
   - Click sample prompt **"Technical 403 Error"** -> Click **Submit Ticket**.
   - **Expected Outcome**: `⏳ Agent Queue Routing` chip with 72% confidence (< 85% threshold), routed to Agent Console.

3. **Perform Agent Review & Override**:
   - Go to **Agent Console** tab -> Select the 403 Error ticket -> Edit the AI draft in the right text box -> Click **Approve & Send Response**.
   - **Expected Outcome**: Ticket state updates to `Resolved by Agent`.

4. **Adjust Auto-Send Threshold**:
   - Go to **KB & Settings** tab -> Drag slider to `90%` -> Save.
   - All subsequent tickets will require $\ge 90\%$ confidence for auto-sending.
