from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import math
import urllib.request
import urllib.error
from html.parser import HTMLParser

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ─────────────────────────────────────────────
# Lightweight TF-IDF + Logistic Regression
# ─────────────────────────────────────────────

TRAINING_DATA = [
    ("BREAKING: Scientists SHOCKED by miracle cure that doctors don't want you to know!!!", 1),
    ("You won't BELIEVE what happened next! Share before it's deleted!", 1),
    ("EXPOSED: The TRUTH they are HIDING from you about vaccines!!!", 1),
    ("This will DESTROY your faith in the government forever!!!", 1),
    ("URGENT: Read this before it gets taken down by the deep state!", 1),
    ("Celebrities are secretly reptiles claims anonymous source", 1),
    ("100% PROVEN: Moon landing was faked in Hollywood studio", 1),
    ("ALERT: New 5G towers causing mass illness, insider reveals all", 1),
    ("Scientists baffled as man grows third eye after eating GMO foods", 1),
    ("The cure for cancer exists but Big Pharma is suppressing it", 1),
    ("SHOCK REPORT: Earth is actually flat, NASA admits in leaked memo", 1),
    ("Anonymous hacker exposes world government secret plan", 1),
    ("They are putting mind control chemicals in drinking water", 1),
    ("SHARE NOW before Facebook deletes this post about election fraud", 1),
    ("Billionaire funds secret weather machine to cause hurricanes", 1),
    ("Scientists publish peer-reviewed study on climate change effects", 0),
    ("Government releases annual budget report with deficit projections", 0),
    ("Local hospital opens new pediatric wing after fundraising campaign", 0),
    ("University researchers develop new water purification method", 0),
    ("City council approves infrastructure spending plan for roads", 0),
    ("Study finds moderate exercise linked to improved cardiovascular health", 0),
    ("Election commission releases official vote count results", 0),
    ("Tech company reports quarterly earnings in SEC filing", 0),
    ("International summit addresses trade policy disagreements", 0),
    ("New archaeological dig uncovers artifacts from ancient civilization", 0),
    ("Central bank adjusts interest rates amid inflation concerns", 0),
    ("School district implements new reading curriculum after pilot program", 0),
    ("Airline announces new routes connecting regional airports", 0),
    ("Research team identifies gene linked to rare inherited disorder", 0),
    ("Court rules on constitutional challenge to new legislation", 0),
]

class TFIDFLogisticRegression:
    def __init__(self):
        self.vocab = {}
        self.idf = {}
        self.weights = []
        self.bias = 0.0
        self.trained = False

    def tokenize(self, text):
        return re.findall(r'[a-z]+', text.lower())

    def build_vocab(self, corpus):
        all_tokens = set()
        for text, _ in corpus:
            all_tokens.update(self.tokenize(text))
        self.vocab = {w: i for i, w in enumerate(sorted(all_tokens))}

    def compute_idf(self, corpus):
        N = len(corpus)
        df = {}
        for text, _ in corpus:
            tokens = set(self.tokenize(text))
            for t in tokens:
                df[t] = df.get(t, 0) + 1
        self.idf = {w: math.log((N + 1) / (df.get(w, 0) + 1)) + 1 for w in self.vocab}

    def vectorize(self, text):
        tokens = self.tokenize(text)
        tf = {}
        for t in tokens:
            tf[t] = tf.get(t, 0) + 1
        vec = [0.0] * len(self.vocab)
        for t, count in tf.items():
            if t in self.vocab:
                vec[self.vocab[t]] = (count / len(tokens)) * self.idf.get(t, 1.0)
        norm = math.sqrt(sum(v*v for v in vec)) or 1.0
        return [v / norm for v in vec]

    def sigmoid(self, z):
        return 1 / (1 + math.exp(-max(-500, min(500, z))))

    def predict_prob(self, vec):
        z = self.bias + sum(w * x for w, x in zip(self.weights, vec))
        return self.sigmoid(z)

    def train(self, corpus, lr=0.3, epochs=500):
        self.build_vocab(corpus)
        self.compute_idf(corpus)
        n_features = len(self.vocab)
        self.weights = [0.0] * n_features
        self.bias = 0.0
        for _ in range(epochs):
            for text, label in corpus:
                vec = self.vectorize(text)
                pred = self.predict_prob(vec)
                error = pred - label
                self.bias -= lr * error
                for i in range(n_features):
                    self.weights[i] -= lr * error * vec[i]
        self.trained = True

    def predict(self, text):
        vec = self.vectorize(text)
        prob = self.predict_prob(vec)
        return {
            "fake_probability": round(prob, 4),
            "real_probability": round(1 - prob, 4),
            "ml_verdict": "FAKE" if prob >= 0.5 else "REAL",
            "confidence": round(abs(prob - 0.5) * 2, 4)
        }

model = TFIDFLogisticRegression()
model.train(TRAINING_DATA)
print("✅ ML model trained successfully")

# ─────────────────────────────────────────────
# Heuristic Engine
# ─────────────────────────────────────────────

FAKE_KEYWORDS_EN = [
    "shocking", "exposed", "secret", "hidden", "banned", "deleted",
    "censored", "leaked", "conspiracy", "hoax", "fraud", "scam",
    "fake", "lie", "truth", "wake up", "share now", "urgent",
    "miracle", "cure", "destroy", "deep state", "illuminati", "nwo",
    "you won't believe", "doctors hate", "one weird trick", "before it's too late",
    "mind control", "reptile", "chemtrail", "microchip", "bill gates",
    "5g", "depopulation", "satanic", "elite", "new world order"
]

CLICKBAIT_PHRASES_EN = [
    "you won't believe", "what happened next", "share before",
    "read this now", "must read", "going viral", "breaking news",
    "shocking truth", "doctors don't want", "they don't want you to know",
    "this will change", "once you see this", "unbelievable"
]

FAKE_KEYWORDS_HI = [
    "सनसनीखेज", "षड्यंत्र", "खुलासा", "सच्चाई", "छुपाया",
    "वायरल", "शेयर करो", "जागो", "सरकार छुपा रही", "जहर",
    "बड़ा खुलासा", "तुरंत शेयर", "देशद्रोह", "मीडिया नहीं बताएगा",
    "अभी शेयर करें", "हिंदू खतरे में", "मुसलमान", "भारत बर्बाद"
]

NEWS_PATTERNS = [
    "according to", "reported", "official", "confirmed", "announced",
    "published", "spokesperson", "press release", "government", "authority",
    "study shows", "research indicates", "data reveals", "statistics"
]

BLOG_PATTERNS = [
    "i think", "in my opinion", "i believe", "personally", "i feel",
    "my view", "i'd say", "from my experience", "in my experience",
    "i've found", "to me", "i reckon"
]

TRUSTED_DOMAINS = [
    "bbc.com", "bbc.co.uk", "reuters.com", "ndtv.com", "thehindu.com",
    "hindustantimes.com", "indianexpress.com", "apnews.com", "pti.in",
    "bloomberg.com", "theguardian.com", "nytimes.com", "washingtonpost.com"
]

def detect_language(text):
    hindi_chars = len(re.findall(r'[\u0900-\u097F]', text))
    return "hi" if hindi_chars > 5 else "en"

def detect_content_type(text):
    text_lower = text.lower()
    news_hits = sum(1 for p in NEWS_PATTERNS if p in text_lower)
    blog_hits = sum(1 for p in BLOG_PATTERNS if p in text_lower)
    if news_hits > blog_hits and news_hits >= 1:
        return "News", "📰"
    elif blog_hits > 0:
        return "Blog/Opinion", "✍️"
    else:
        return "Unknown", "❓"

def detect_trusted_source(text, url=""):
    combined = (text + " " + url).lower()
    for domain in TRUSTED_DOMAINS:
        if domain in combined:
            return True, domain
    return False, None

def heuristic_analyze(text):
    lang = detect_language(text)
    signals = []
    score = 0

    keywords = FAKE_KEYWORDS_HI if lang == "hi" else FAKE_KEYWORDS_EN
    clickbait = [] if lang == "hi" else CLICKBAIT_PHRASES_EN
    text_lower = text.lower()

    words = text.split()
    if words:
        caps_ratio = sum(1 for w in words if w.isupper() and len(w) > 2) / len(words)
        if caps_ratio > 0.3:
            score += 25
            signals.append({"type": "EXCESSIVE_CAPS", "weight": 25,
                "detail": f"{int(caps_ratio*100)}% words in ALL CAPS — common in sensational content"})
        elif caps_ratio > 0.15:
            score += 12
            signals.append({"type": "MODERATE_CAPS", "weight": 12,
                "detail": f"Elevated use of ALL CAPS ({int(caps_ratio*100)}%)"})

    exclamations = text.count('!')
    if exclamations >= 3:
        score += 20
        signals.append({"type": "EXCESSIVE_EXCLAMATION", "weight": 20,
            "detail": f"{exclamations} exclamation marks — hallmark of emotional manipulation"})
    elif exclamations >= 2:
        score += 10
        signals.append({"type": "MULTIPLE_EXCLAMATION", "weight": 10,
            "detail": f"{exclamations} exclamation marks detected"})

    found_clickbait = [p for p in clickbait if p in text_lower]
    if found_clickbait:
        pts = min(30, len(found_clickbait) * 15)
        score += pts
        signals.append({"type": "CLICKBAIT_PHRASES", "weight": pts,
            "detail": f"Clickbait phrases found: {', '.join(found_clickbait[:3])}"})

    found_kw = [kw for kw in keywords if kw in text_lower]
    if found_kw:
        pts = min(25, len(found_kw) * 8)
        score += pts
        signals.append({"type": "FAKE_KEYWORDS", "weight": pts,
            "detail": f"Suspicious keywords: {', '.join(found_kw[:4])}"})

    has_source = bool(re.search(
        r'according to|reported by|source:|via |study|research|journal|published|official',
        text_lower
    ))
    if not has_source and len(text) > 80:
        score += 10
        signals.append({"type": "NO_SOURCE", "weight": 10,
            "detail": "No credible source or citation mentioned"})

    urgency_phrases = ["share now", "share before", "read before", "act now",
                       "tell everyone", "warn others", "अभी शेयर", "तुरंत शेयर"]
    found_urgency = [p for p in urgency_phrases if p in text_lower]
    if found_urgency:
        score += 15
        signals.append({"type": "URGENCY_LANGUAGE", "weight": 15,
            "detail": f"Urgency/viral push language detected: {found_urgency[0]}"})

    score = min(score, 100)

    if score >= 70:
        verdict = "FAKE"
        risk = "HIGH"
    elif score >= 40:
        verdict = "SUSPICIOUS"
        risk = "MEDIUM"
    else:
        verdict = "LIKELY REAL"
        risk = "LOW"

    return {
        "heuristic_score": score,
        "heuristic_verdict": verdict,
        "risk_level": risk,
        "signals": signals,
        "language": lang,
        "signal_count": len(signals)
    }

# ─────────────────────────────────────────────
# URL Fetcher (403-resistant)
# ─────────────────────────────────────────────

def fetch_url_text(url):
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
            'Accept-Encoding': 'identity',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0',
        })
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read(500 * 1024).decode('utf-8', errors='ignore')

        # Strip scripts, styles, nav, footer via regex
        html = re.sub(r'<(script|style|nav|footer|header|noscript)[^>]*>.*?</\1>', ' ', html, flags=re.DOTALL | re.IGNORECASE)
        # Strip all remaining HTML tags
        text = re.sub(r'<[^>]+>', ' ', html)
        # Collapse whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        # Remove single-character junk tokens
        words = [w for w in text.split() if len(w) > 1]
        text = ' '.join(words)

        if len(text) < 50:
            return None, "Unable to fetch content. Please paste text manually."

        return text[:3000], None

    except urllib.error.HTTPError:
        return None, "Unable to fetch content. Please paste text manually."
    except urllib.error.URLError:
        return None, "Unable to fetch content. Please paste text manually."
    except Exception:
        return None, "Unable to fetch content. Please paste text manually."

# ─────────────────────────────────────────────
# Core Analysis Function
# ─────────────────────────────────────────────

def full_analyze(text, url=""):
    heuristic = heuristic_analyze(text)
    ml = model.predict(text)

    combined_score = round(
        0.6 * heuristic["heuristic_score"] + 0.4 * (ml["fake_probability"] * 100)
    )

    if combined_score >= 65:
        final_verdict = "FAKE"
        verdict_color = "red"
        suggestion = "⚠️ Verify before sharing. This content shows multiple misinformation signals."
        sharing_risk = "HIGH"
    elif combined_score >= 40:
        final_verdict = "SUSPICIOUS"
        verdict_color = "orange"
        suggestion = "🔍 Needs verification. Cross-check with reliable sources before sharing."
        sharing_risk = "MEDIUM"
    else:
        final_verdict = "LIKELY REAL"
        verdict_color = "green"
        suggestion = "✅ Appears reliable. Content follows patterns of credible reporting."
        sharing_risk = "LOW"

    content_type, content_icon = detect_content_type(text)
    is_trusted, trusted_domain = detect_trusted_source(text, url)

    why_flagged = [sig["detail"] for sig in heuristic["signals"]]

    return {
        "text_preview": text[:120] + ("..." if len(text) > 120 else ""),
        "final_verdict": final_verdict,
        "verdict_color": verdict_color,
        "combined_score": combined_score,
        "confidence": round(abs(combined_score - 50) / 50, 2),
        "prediction": final_verdict,
        "suggestion": suggestion,
        "sharing_risk": sharing_risk,
        "why_flagged": why_flagged,
        "content_type": content_type,
        "content_icon": content_icon,
        "is_trusted_source": is_trusted,
        "trusted_domain": trusted_domain,
        "language": heuristic["language"],
        "heuristic": heuristic,
        "ml": ml,
    }

# ─────────────────────────────────────────────
# API Routes
# ─────────────────────────────────────────────

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "model_trained": model.trained})

@app.route('/predict', methods=['POST'])
def predict_compat():
    return analyze_text()

@app.route('/api/analyze/text', methods=['POST'])
def analyze_text():
    data = request.get_json(force=True)
    text = data.get('text', '').strip()
    if not text:
        return jsonify({"error": "No text provided"}), 400
    if len(text) < 10:
        return jsonify({"error": "Text too short"}), 400
    return jsonify(full_analyze(text))

@app.route('/api/analyze/url', methods=['POST'])
def analyze_url():
    data = request.get_json(force=True)
    url = data.get('url', '').strip()
    if not url:
        return jsonify({"error": "No URL provided"}), 400

    text, err = fetch_url_text(url)
    if err or not text or len(text) < 20:
        return jsonify({"error": "Unable to fetch content. Please paste text manually."}), 422

    result = full_analyze(text, url=url)
    result["source_url"] = url
    return jsonify(result)

@app.route('/api/analyze/image', methods=['POST'])
def analyze_image():
    import random
    score = random.randint(20, 85)
    return jsonify({
        "verdict": "LIKELY DEEPFAKE" if score > 55 else "LIKELY AUTHENTIC",
        "confidence": round(score / 100, 2),
        "checks": [
            {"name": "Facial landmark consistency", "result": "Anomalies detected" if score > 55 else "Normal"},
            {"name": "Compression artifact analysis", "result": "High inconsistency" if score > 65 else "Normal"},
            {"name": "Metadata integrity", "result": "Missing EXIF data" if score > 45 else "Present"},
            {"name": "GAN fingerprint scan", "result": "Pattern detected" if score > 70 else "Not detected"},
        ],
        "note": "Prototype: This is a mock analysis. Full model not integrated."
    })

@app.route('/api/analyze/video', methods=['POST'])
def analyze_video():
    import random
    score = random.randint(15, 90)
    return jsonify({
        "verdict": "DEEPFAKE SUSPECTED" if score > 55 else "LIKELY AUTHENTIC",
        "confidence": round(score / 100, 2),
        "frame_analysis": {
            "frames_sampled": 30,
            "suspicious_frames": random.randint(2, 12) if score > 55 else random.randint(0, 3),
            "avg_anomaly_score": round(score / 100, 2)
        },
        "checks": [
            {"name": "Temporal consistency", "result": "Inconsistencies found" if score > 55 else "Consistent"},
            {"name": "Lip-sync accuracy", "result": "Mismatch detected" if score > 65 else "Normal"},
            {"name": "Eye blink pattern", "result": "Irregular" if score > 60 else "Natural"},
            {"name": "Audio-visual sync", "result": "Desync detected" if score > 70 else "Synced"},
        ],
        "note": "Prototype: This is a mock analysis. Full model not integrated."
    })

import os

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)