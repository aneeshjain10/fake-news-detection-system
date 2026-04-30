# 🛡️ FakeGuard AI — Fake News & Deepfake Detection System

> AI-Powered Cross-Media Fake News & Deepfake Detection  
> BTech Final Year Project | Hybrid Heuristic + ML Approach

---

## 📁 Project Structure

```
fake-news-detector/
├── backend/
│   ├── app.py              # Flask ML backend (TF-IDF + Logistic Regression from scratch)
│   └── requirements.txt    # Flask, flask-cors only
└── frontend/
    ├── pages/
    │   ├── index.js        # Login / Signup page
    │   └── dashboard.js    # Main dashboard with tabs
    ├── components/
    │   ├── Navbar.js
    │   ├── TextAnalysis.js  # Core analysis component
    │   ├── ImageAnalysis.js # Prototype
    │   ├── VideoAnalysis.js # Prototype
    │   ├── ScoreGauge.js    # Animated score gauge
    │   ├── SignalCard.js    # Signal display card
    │   └── HistorySidebar.js
    ├── utils/
    │   └── auth.js          # localStorage auth helpers
    ├── styles/
    │   └── globals.css
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

---

## 🚀 Setup & Run

### Prerequisites
- Node.js 18+
- Python 3.8+

---

### Step 1: Start Flask Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Backend runs at: **http://localhost:5000**

---

### Step 2: Start Next.js Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

### Step 3: Open App

Go to **http://localhost:3000**

**Demo login:**
- Email: `demo@test.com`
- Password: `demo123`

Or click **Sign Up** to create an account.

---

## 🧠 System Design

### Hybrid Detection Approach

```
Input Text
    │
    ├── Heuristic Engine (60% weight)
    │       ├── Excessive CAPS detection
    │       ├── Clickbait phrase matching
    │       ├── Suspicious keyword matching (EN + HI)
    │       ├── Excessive punctuation (!!)
    │       ├── Urgency language detection
    │       └── Source/citation check
    │
    └── ML Model (40% weight)
            ├── TF-IDF vectorization (built from scratch)
            └── Logistic Regression (gradient descent, no sklearn)
                    │
                    └── Combined Score → Final Verdict
```

### Final Verdict Thresholds

| Combined Score | Verdict       |
|---------------|---------------|
| ≥ 65          | 🔴 FAKE       |
| 40–64         | 🟡 SUSPICIOUS |
| < 40          | 🟢 LIKELY REAL|

---

## 🌐 Multilingual Support

- **English**: Full heuristic + ML analysis
- **Hindi**: Detected via Unicode range `\u0900-\u097F`, uses Hindi-specific keyword list

---

## 📡 API Endpoints

| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| GET    | `/api/health`         | Backend health check |
| POST   | `/api/analyze/text`   | Text analysis        |
| POST   | `/api/analyze/image`  | Image (prototype)    |
| POST   | `/api/analyze/video`  | Video (prototype)    |

### Text Analysis Response

```json
{
  "final_verdict": "FAKE",
  "combined_score": 78,
  "verdict_color": "red",
  "heuristic": {
    "heuristic_score": 80,
    "heuristic_verdict": "FAKE",
    "risk_level": "HIGH",
    "language": "en",
    "signal_count": 4,
    "signals": [
      {
        "type": "EXCESSIVE_CAPS",
        "weight": 25,
        "detail": "45% words in ALL CAPS — common in sensational content"
      }
    ]
  },
  "ml": {
    "ml_verdict": "FAKE",
    "fake_probability": 0.87,
    "real_probability": 0.13,
    "confidence": 0.74
  }
}
```

---

## 🔒 Authentication

- Users stored in `localStorage` under key `fnd_users`
- Session stored under `fnd_session`
- Analysis history stored under `fnd_history` (last 50 entries)
- No database required

---

## 🏗️ Tech Stack

| Layer     | Technology                    |
|-----------|-------------------------------|
| Frontend  | Next.js 14, React 18          |
| Styling   | Tailwind CSS                  |
| Backend   | Python Flask                  |
| ML Model  | TF-IDF + Logistic Regression (scratch) |
| Storage   | localStorage (no DB)          |
| Auth      | Custom localStorage auth      |

---

## 📝 Viva Points

1. **Why heuristic + ML hybrid?** — Heuristics give explainability; ML catches statistical patterns heuristics miss. Combined gives better accuracy than either alone.

2. **Why TF-IDF + Logistic Regression instead of BERT?** — Lightweight, runs locally without GPU, explainable, fast inference (<10ms), and sufficient for this demonstration scope.

3. **How does TF-IDF work?** — Term Frequency × Inverse Document Frequency weights rare-but-important words higher than common words, creating numerical vectors for text classification.

4. **Why no database?** — localStorage is sufficient for a prototype/demo, avoids setup complexity, and data persists across sessions per browser.

5. **How is Hindi detected?** — Unicode range check: characters in `\u0900-\u097F` are Devanagari script. If >5 such characters exist, text is classified as Hindi.

6. **What are the 6 heuristic signals?** — (1) Excessive CAPS, (2) Multiple exclamations, (3) Clickbait phrases, (4) Fake/conspiracy keywords, (5) No source citation, (6) Urgency call-to-action language.

---

## ⚠️ Limitations (mention in viva)

- ML model trained on small synthetic dataset (demo purposes)
- Image/Video analysis is prototype (mock responses)
- Hindi ML classification not fully implemented (heuristic only for Hindi)
- No persistent database

---

*Built as BTech Final Year Project demonstrating hybrid AI approach to misinformation detection.*
