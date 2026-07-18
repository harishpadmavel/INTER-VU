import json
from pathlib import Path
from datetime import datetime

DATA_FILE = Path(__file__).resolve().parent / 'data' / 'history.json'


def load_history():
    if not DATA_FILE.exists():
        return []
    with DATA_FILE.open('r', encoding='utf-8') as handle:
        return json.load(handle)


def save_history(entry):
    history = load_history()
    history.append(entry)
    with DATA_FILE.open('w', encoding='utf-8') as handle:
        json.dump(history, handle, indent=2)
    return history


def add_session(session_data):
    entry = {
        'id': len(load_history()) + 1,
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'role': session_data.get('role', 'Technical Interview'),
        'score': session_data.get('score', 0),
        'feedback': session_data.get('feedback', ''),
        'questions_answered': session_data.get('questions_answered', 0),
        'status': session_data.get('status', 'completed')
    }
    return save_history(entry)


def get_history():
    return load_history()
