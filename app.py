from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from datetime import datetime
import bcrypt
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Database configuration
db_config = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'your_username'),
    'password': os.getenv('DB_PASSWORD', 'your_password'),
    'database': os.getenv('DB_NAME', 'mindtrack')
}

def get_db_connection():
    return mysql.connector.connect(**db_config)

# Auth routes
@app.route('/api/auth', methods=['POST'])
def auth():
    data = request.get_json()
    action = data.get('action')
    
    if action == 'register':
        return register_user(data)
    elif action == 'login':
        return login_user(data)
    
    return jsonify({'success': False, 'message': 'Invalid action'})

def register_user(data):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Hash password and security word
        password_hash = bcrypt.hashpw(data['password'].encode(), bcrypt.gensalt())
        security_word_hash = bcrypt.hashpw(data['security_word'].encode(), bcrypt.gensalt())
        
        query = """INSERT INTO users 
                  (username, email, password_hash, security_word) 
                  VALUES (%s, %s, %s, %s)"""
        
        cursor.execute(query, (
            data['username'],
            data['email'],
            password_hash,
            security_word_hash
        ))
        
        conn.commit()
        user_id = cursor.lastrowid
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'user_id': user_id
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        })

def login_user(data):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = "SELECT * FROM users WHERE email = %s"
        cursor.execute(query, (data['email'],))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'Invalid credentials'
            })
        
        # Check if account is locked
        if user['locked_until'] and user['locked_until'] > datetime.now():
            return jsonify({
                'success': False,
                'message': 'Account is locked. Please use your security word.',
                'locked': True
            })
        
        # Verify password or security word
        if data.get('security_word'):
            is_valid = bcrypt.checkpw(
                data['security_word'].encode(),
                user['security_word'].encode()
            )
        else:
            is_valid = bcrypt.checkpw(
                data['password'].encode(),
                user['password_hash'].encode()
            )
        
        if is_valid:
            # Reset login attempts
            reset_login_attempts(cursor, user['id'])
            conn.commit()
            
            cursor.close()
            conn.close()
            
            return jsonify({
                'success': True,
                'user_id': user['id'],
                'username': user['username']
            })
        
        # Failed login attempt
        increment_login_attempts(cursor, user['id'])
        conn.commit()
        
        attempts_left = 5 - (user['login_attempts'] + 1)
        
        cursor.close()
        conn.close()
        
        if attempts_left <= 0:
            return jsonify({
                'success': False,
                'message': 'Account locked. Please use your security word.',
                'locked': True
            })
        
        return jsonify({
            'success': False,
            'message': f'Invalid credentials. {attempts_left} attempts remaining.'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        })

# Journal routes
@app.route('/api/journal', methods=['GET', 'POST'])
def journal():
    if request.method == 'GET':
        user_id = request.args.get('user_id')
        return get_journal_entries(user_id)
    else:
        data = request.get_json()
        return create_journal_entry(data)

def get_journal_entries(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """SELECT * FROM journal_entries 
                  WHERE user_id = %s 
                  ORDER BY created_at DESC"""
        
        cursor.execute(query, (user_id,))
        entries = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'entries': entries
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        })

def create_journal_entry(data):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """INSERT INTO journal_entries 
                  (user_id, title, content, tags, mood) 
                  VALUES (%s, %s, %s, %s, %s)"""
        
        cursor.execute(query, (
            data['user_id'],
            data['title'],
            data['content'],
            data['tags'],
            data['mood']
        ))
        
        conn.commit()
        entry_id = cursor.lastrowid
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'id': entry_id
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        })

# Helper functions
def reset_login_attempts(cursor, user_id):
    query = """UPDATE users 
              SET login_attempts = 0, locked_until = NULL 
              WHERE id = %s"""
    cursor.execute(query, (user_id,))

def increment_login_attempts(cursor, user_id):
    query = """UPDATE users 
              SET login_attempts = login_attempts + 1,
              locked_until = CASE 
                WHEN login_attempts + 1 >= 5 
                THEN DATE_ADD(NOW(), INTERVAL 1800 SECOND)
                ELSE NULL 
              END
              WHERE id = %s"""
    cursor.execute(query, (user_id,))

if __name__ == '__main__':
    app.run(debug=True) 