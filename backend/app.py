from flask import Flask, jsonify, request
from flask_cors import CORS
from history_store import add_session, get_history
import os
from services.resume_parser import extract_text

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.get('/')
def home():
    return jsonify({
        'message': 'INTER-VU API is running',
        'status': 'success'
    })

@app.get('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'backend'
    })

@app.post('/history')
def save_history():
    payload = request.get_json(silent=True) or {}
    sessions = add_session(payload)
    return jsonify({
        'status': 'saved',
        'history': sessions
    })

@app.get('/history')
def history():
    return jsonify({
        'status': 'success',
        'history': get_history()
    })
@app.post("/upload_resume")
def upload_resume():
    if "resume" not in request.files:
        return jsonify({
            "status": "error",
            "message": "No resume uploaded"
        }), 400

    file = request.files["resume"]

    if file.filename == "":
        return jsonify({
            "status": "error",
            "message": "Empty filename"
        }), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    resume_text = extract_text(filepath)

    return jsonify({
        "status": "success",
        "filename": file.filename,
        "resume_text": resume_text[:1000]
    })
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)