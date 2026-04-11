import azure.functions as func
import json
import os
import pyodbc
import bcrypt
import jwt
import math
import re
import secrets
from datetime import datetime, timezone, timedelta
from slugify import slugify

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

# ─── Helpers ─────────────────────────────────────────────

def get_db_conn():
    return pyodbc.connect(os.environ['SQL_CONNECTION_STRING'])

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain, hashed):
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(user_id, email):
    payload = {
        'sub': str(user_id), 'email': email,
        'exp': datetime.now(timezone.utc) + timedelta(hours=24),
        'type': 'access'
    }
    return jwt.encode(payload, os.environ['JWT_SECRET'], algorithm='HS256')

def get_current_user(req):
    """Extract user from cookie or Authorization header."""
    token = None
    cookies = req.headers.get('Cookie', '')
    for cookie in cookies.split(';'):
        c = cookie.strip()
        if c.startswith('access_token='):
            token = c[len('access_token='):]
            break
    if not token:
        auth = req.headers.get('Authorization', '')
        if auth.startswith('Bearer '):
            token = auth[7:]
    if not token:
        return None
    try:
        payload = jwt.decode(token, os.environ['JWT_SECRET'], algorithms=['HS256'])
        if payload.get('type') != 'access':
            return None
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute('SELECT id, email, name, role FROM users WHERE id = ?', (int(payload['sub']),))
        row = cursor.fetchone()
        conn.close()
        if not row:
            return None
        return {'id': row[0], 'email': row[1], 'name': row[2], 'role': row[3]}
    except Exception:
        return None

def calculate_read_time(content):
    if not content:
        return '1 min read'
    words = len(re.findall(r'\w+', content))
    return f'{max(1, math.ceil(words / 200))} min read'

def json_response(data, status=200, headers=None):
    resp = func.HttpResponse(
        json.dumps(data, default=str),
        status_code=status,
        mimetype='application/json'
    )
    if headers:
        for k, v in headers.items():
            resp.headers[k] = v
    return resp

def error_response(detail, status=400):
    return json_response({'detail': detail}, status=status)

def rows_to_dicts(cursor):
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]

# ─── Health ──────────────────────────────────────────────

@app.route(route="health", methods=["GET"])
def health(req: func.HttpRequest) -> func.HttpResponse:
    return json_response({'status': 'ok'})

# ─── Seed (run once after DB setup) ─────────────────────

@app.route(route="seed", methods=["POST"])
def seed_admin(req: func.HttpRequest) -> func.HttpResponse:
    try:
        admin_email = os.environ.get('ADMIN_EMAIL', 'admin@kloudvin.com')
        admin_password = os.environ.get('ADMIN_PASSWORD', 'KloudV1n@2026!')
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute('SELECT id FROM users WHERE email = ?', (admin_email,))
        if not cursor.fetchone():
            cursor.execute(
                'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
                (admin_email, hash_password(admin_password), 'Vinod H', 'admin')
            )
            conn.commit()
            conn.close()
            return json_response({'message': 'Admin user seeded'})
        conn.close()
        return json_response({'message': 'Admin already exists'})
    except Exception as e:
        return error_response(str(e), 500)

# ─── Auth ────────────────────────────────────────────────

@app.route(route="auth/login", methods=["POST"])
def login(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json()
        email = body.get('email', '').lower().strip()
        password = body.get('password', '')

        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute('SELECT id, email, password_hash, name, role FROM users WHERE email = ?', (email,))
        row = cursor.fetchone()
        conn.close()

        if not row or not verify_password(password, row[2]):
            return error_response('Invalid credentials', 401)

        token = create_access_token(row[0], row[1])
        headers = {
            'Set-Cookie': f'access_token={token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax'
        }
        return json_response(
            {'id': row[0], 'email': row[1], 'name': row[3], 'role': row[4], 'token': token},
            headers=headers
        )
    except Exception as e:
        return error_response(str(e), 500)

@app.route(route="auth/logout", methods=["POST"])
def logout(req: func.HttpRequest) -> func.HttpResponse:
    headers = {'Set-Cookie': 'access_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax'}
    return json_response({'message': 'Logged out'}, headers=headers)

@app.route(route="auth/me", methods=["GET"])
def get_me(req: func.HttpRequest) -> func.HttpResponse:
    user = get_current_user(req)
    if not user:
        return error_response('Not authenticated', 401)
    return json_response(user)

# ─── Articles ────────────────────────────────────────────

@app.route(route="articles", methods=["GET"])
def list_articles(req: func.HttpRequest) -> func.HttpResponse:
    try:
        category = req.params.get('category')
        conn = get_db_conn()
        cursor = conn.cursor()

        if category and category != 'All Topics':
            cursor.execute('''
                SELECT slug, title, category, description, author, read_time,
                       published, views, created_at, updated_at
                FROM articles WHERE published = 1 AND category LIKE ?
                ORDER BY created_at DESC
            ''', (f'%{category}%',))
        else:
            cursor.execute('''
                SELECT slug, title, category, description, author, read_time,
                       published, views, created_at, updated_at
                FROM articles WHERE published = 1
                ORDER BY created_at DESC
            ''')

        articles = rows_to_dicts(cursor)
        conn.close()
        return json_response(articles)
    except Exception as e:
        return error_response(str(e), 500)

@app.route(route="articles_create", methods=["POST"])
def create_article_func(req: func.HttpRequest) -> func.HttpResponse:
    """POST /api/articles_create — Use this or configure route properly."""
    try:
        user = get_current_user(req)
        if not user:
            return error_response('Not authenticated', 401)

        body = req.get_json()
        title = body.get('title')
        category = body.get('category')
        description = body.get('description')
        content = body.get('content')
        author = body.get('author', 'Vinod')

        slug = slugify(title)
        read_time = calculate_read_time(content)
        now = datetime.now(timezone.utc).isoformat()

        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute('SELECT 1 FROM articles WHERE slug = ?', (slug,))
        if cursor.fetchone():
            slug = f'{slug}-{secrets.token_hex(3)}'

        cursor.execute('''
            INSERT INTO articles (slug, title, category, description, content, author, read_time, published, views, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0, ?, ?)
        ''', (slug, title, category, description, content, author, read_time, now, now))
        conn.commit()
        conn.close()

        return json_response({
            'slug': slug, 'title': title, 'category': category,
            'description': description, 'author': author,
            'read_time': read_time, 'published': True, 'views': 0,
            'created_at': now, 'updated_at': now
        }, 201)
    except Exception as e:
        return error_response(str(e), 500)

@app.route(route="articles/{slug}", methods=["GET"])
def get_article(req: func.HttpRequest) -> func.HttpResponse:
    try:
        slug = req.route_params.get('slug')
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT slug, title, category, description, content, author, read_time,
                   published, views, created_at, updated_at
            FROM articles WHERE slug = ?
        ''', (slug,))
        row = cursor.fetchone()
        if not row:
            conn.close()
            return error_response('Article not found', 404)

        columns = [col[0] for col in cursor.description]
        article = dict(zip(columns, row))
        cursor.execute('UPDATE articles SET views = views + 1 WHERE slug = ?', (slug,))
        conn.commit()
        conn.close()
        return json_response(article)
    except Exception as e:
        return error_response(str(e), 500)

@app.route(route="articles/{slug}/update", methods=["PUT"])
def update_article_func(req: func.HttpRequest) -> func.HttpResponse:
    try:
        user = get_current_user(req)
        if not user:
            return error_response('Not authenticated', 401)

        slug = req.route_params.get('slug')
        body = req.get_json()
        now = datetime.now(timezone.utc).isoformat()

        sets = ['updated_at = ?']
        params = [now]
        for field in ['title', 'category', 'description', 'content']:
            if field in body and body[field] is not None:
                sets.append(f'{field} = ?')
                params.append(body[field])
        if 'content' in body:
            sets.append('read_time = ?')
            params.append(calculate_read_time(body['content']))

        params.append(slug)
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute(f'UPDATE articles SET {", ".join(sets)} WHERE slug = ?', params)
        if cursor.rowcount == 0:
            conn.close()
            return error_response('Article not found', 404)
        conn.commit()

        cursor.execute('SELECT slug, title, category, description, author, read_time, published, views, created_at, updated_at FROM articles WHERE slug = ?', (slug,))
        article = dict(zip([col[0] for col in cursor.description], cursor.fetchone()))
        conn.close()
        return json_response(article)
    except Exception as e:
        return error_response(str(e), 500)

@app.route(route="articles/{slug}/delete", methods=["DELETE"])
def delete_article_func(req: func.HttpRequest) -> func.HttpResponse:
    try:
        user = get_current_user(req)
        if not user:
            return error_response('Not authenticated', 401)

        slug = req.route_params.get('slug')
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM articles WHERE slug = ?', (slug,))
        if cursor.rowcount == 0:
            conn.close()
            return error_response('Article not found', 404)
        conn.commit()
        conn.close()
        return json_response({'message': 'Article deleted'})
    except Exception as e:
        return error_response(str(e), 500)

# ─── Categories ──────────────────────────────────────────

@app.route(route="categories", methods=["GET"])
def list_categories(req: func.HttpRequest) -> func.HttpResponse:
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute('SELECT slug as id, name, icon, description, subcategories FROM categories ORDER BY id')
        cats = rows_to_dicts(cursor)
        conn.close()
        for c in cats:
            if c.get('subcategories'):
                try:
                    c['subcategories'] = json.loads(c['subcategories'])
                except Exception:
                    c['subcategories'] = []
            else:
                c['subcategories'] = []
        return json_response(cats)
    except Exception as e:
        return error_response(str(e), 500)

@app.route(route="categories_create", methods=["POST"])
def create_category_func(req: func.HttpRequest) -> func.HttpResponse:
    try:
        user = get_current_user(req)
        if not user:
            return error_response('Not authenticated', 401)

        body = req.get_json()
        cat_slug = slugify(body['name'])
        subcats = json.dumps(body.get('subcategories', []))

        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO categories (slug, name, icon, description, subcategories) VALUES (?, ?, ?, ?, ?)',
            (cat_slug, body['name'], body.get('icon', 'Cloud'), body.get('description', ''), subcats)
        )
        conn.commit()
        conn.close()
        return json_response({'id': cat_slug, 'name': body['name'], 'icon': body.get('icon'), 'description': body.get('description'), 'subcategories': body.get('subcategories', [])}, 201)
    except Exception as e:
        return error_response(str(e), 500)

@app.route(route="categories/{cat_id}", methods=["DELETE"])
def delete_category_func(req: func.HttpRequest) -> func.HttpResponse:
    try:
        user = get_current_user(req)
        if not user:
            return error_response('Not authenticated', 401)

        cat_id = req.route_params.get('cat_id')
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM categories WHERE slug = ?', (cat_id,))
        if cursor.rowcount == 0:
            conn.close()
            return error_response('Category not found', 404)
        conn.commit()
        conn.close()
        return json_response({'message': 'Category deleted'})
    except Exception as e:
        return error_response(str(e), 500)

# ─── Subscribers ─────────────────────────────────────────

@app.route(route="subscribe", methods=["POST"])
def subscribe(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json()
        email = body.get('email', '').lower().strip()
        if not email or '@' not in email:
            return error_response('Invalid email', 400)

        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute('SELECT 1 FROM subscribers WHERE email = ?', (email,))
        if cursor.fetchone():
            conn.close()
            return json_response({'message': 'Already subscribed!', 'already_subscribed': True})

        cursor.execute(
            'INSERT INTO subscribers (email, subscribed_at, active) VALUES (?, GETUTCDATE(), 1)',
            (email,)
        )
        conn.commit()
        conn.close()
        return json_response({'message': 'Successfully subscribed!', 'already_subscribed': False})
    except Exception as e:
        return error_response(str(e), 500)

@app.route(route="subscribers", methods=["GET"])
def list_subscribers(req: func.HttpRequest) -> func.HttpResponse:
    try:
        user = get_current_user(req)
        if not user:
            return error_response('Not authenticated', 401)

        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute('SELECT email, subscribed_at, active FROM subscribers ORDER BY subscribed_at DESC')
        subs = rows_to_dicts(cursor)
        conn.close()
        return json_response(subs)
    except Exception as e:
        return error_response(str(e), 500)
