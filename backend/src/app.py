from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import psycopg2
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

def get_db_connection():
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        raise ValueError("DATABASE_URL environment variable is not set")
    conn = psycopg2.connect(db_url)
    return conn

# API endpoint to get all projects data
@app.route('/api/projects')
def get_projects():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT project_id, project_name, status, total_budget, budget_spent, risk_score FROM projects;')
    projects = cur.fetchall()
    cur.close()
    conn.close()

    projects_list = []
    for proj in projects:
        projects_list.append({
            'project_id': proj[0],
            'project_name': proj[1],
            'status': proj[2],
            'total_budget': float(proj[3]) / 10000000,
            'budget_spent': float(proj[4]) / 10000000,
            'risk_score': proj[5]
        })
    return jsonify(projects_list)

# API endpoint to get financial data
@app.route('/api/financials')
def get_financials():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT quarter, total_revenue, total_expenditure FROM financials ORDER BY quarter ASC;')
    financials = cur.fetchall()
    cur.close()
    conn.close()

    financials_list = []
    for fin in financials:
        financials_list.append({
            'name': fin[0],
            'revenue': float(fin[1]) / 10000000,
            'expenditure': float(fin[2]) / 10000000
        })

    expenditure_breakdown = [
        {'name': 'Raw Materials', 'value': 3.5},
        {'name': 'Labor', 'value': 2.8},
        {'name': 'Overhead', 'value': 1.2},
        {'name': 'R&D', 'value': 0.45},
    ]

    return jsonify({'quarterly_data': financials_list, 'expenditure_breakdown': expenditure_breakdown})

# API endpoint to get suppliers data
@app.route('/api/suppliers')
def get_suppliers():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT supplier_name, delivery_rate, quality_score, risk_level FROM suppliers;')
    suppliers = cur.fetchall()
    cur.close()
    conn.close()

    suppliers_list = []
    for sup in suppliers:
        suppliers_list.append({
            'name': sup[0],
            'deliveries': sup[1],
            'quality': sup[2],
            'risk': sup[3]
        })
    return jsonify(suppliers_list)

# ----- Authentication and Admin API Endpoints -----

# TEMPORARY endpoint to generate a password hash for the SQL script
# Visit http://localhost:5000/api/generate-password-hash?password=YOUR_PASSWORD
@app.route('/api/generate-password-hash', methods=['GET'])
def generate_hash():
    password = request.args.get('password')
    if password:
        hashed_password = generate_password_hash(password)
        return jsonify({'password_hash': hashed_password})
    return jsonify({'message': 'Please provide a password as a query parameter'}), 400

# POST endpoint for user login
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, name, username, password_hash, role, dashboard_permissions FROM users WHERE username = %s;", (username,))
    user = cur.fetchone()
    cur.close()
    conn.close()

    if user and check_password_hash(user[3], password):
        return jsonify({
            'id': user[0],
            'name': user[1],
            'username': user[2],
            'role': user[4],
            'permissions': user[5].split(',') if user[5] else []
        }), 200
    else:
        return jsonify({'message': 'Invalid username or password'}), 401

# GET endpoint to fetch all users
@app.route('/api/users', methods=['GET'])
def get_users():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT id, name, username, role, dashboard_permissions FROM users;')
    users = cur.fetchall()
    cur.close()
    conn.close()

    users_list = []
    for user in users:
        users_list.append({
            'id': user[0],
            'name': user[1],
            'username': user[2],
            'role': user[3],
            'permissions': user[4].split(',') if user[4] else []
        })
    return jsonify(users_list)

# POST endpoint to add a new user
@app.route('/api/users', methods=['POST'])
def add_user():
    user_data = request.json
    conn = get_db_connection()
    cur = conn.cursor()
    
    hashed_password = generate_password_hash(user_data['password'])
    permissions = ','.join(user_data['permissions']) if 'permissions' in user_data else ''
    cur.execute("INSERT INTO users (name, username, password_hash, role, dashboard_permissions) VALUES (%s, %s, %s, %s, %s) RETURNING id;",
                (user_data['name'], user_data['username'], hashed_password, user_data['role'], permissions))
    new_user_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'id': new_user_id, 'message': 'User added successfully'}), 201

# PUT endpoint to update an existing user
@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user_data = request.json
    conn = get_db_connection()
    cur = conn.cursor()
    
    permissions = ','.join(user_data['permissions']) if 'permissions' in user_data else ''

    if 'password' in user_data and user_data['password']:
        hashed_password = generate_password_hash(user_data['password'])
        cur.execute("UPDATE users SET name = %s, username = %s, password_hash = %s, role = %s, dashboard_permissions = %s WHERE id = %s;",
                    (user_data['name'], user_data['username'], hashed_password, user_data['role'], permissions, user_id))
    else:
        cur.execute("UPDATE users SET name = %s, username = %s, role = %s, dashboard_permissions = %s WHERE id = %s;",
                    (user_data['name'], user_data['username'], user_data['role'], permissions, user_id))
                    
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'message': 'User updated successfully'}), 200

# DELETE endpoint to delete a user
@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM users WHERE id = %s;", (user_id,))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'message': 'User deleted successfully'}), 200

# This is the original status check endpoint
@app.route('/api/status')
def get_status():
    return jsonify({
        "status": "Backend is running!",
        "message": "Connected to the API and ready to serve data."
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
