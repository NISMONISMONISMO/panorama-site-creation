"""
Система аутентификации и управления пользователями
"""

import json
import hashlib
import secrets
import re
import os
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

def hash_password(password: str) -> str:
    """Хеширование пароля с солью"""
    salt = secrets.token_hex(16)
    password_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
    return f"{salt}:{password_hash.hex()}"

def verify_password(password: str, password_hash: str) -> bool:
    """Проверка пароля"""
    try:
        salt, stored_hash = password_hash.split(':')
        password_hash_check = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
        return password_hash_check.hex() == stored_hash
    except ValueError:
        return False

def validate_email(email: str) -> bool:
    """Валидация email"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def generate_session_token() -> str:
    """Генерация токена сессии"""
    return secrets.token_urlsafe(32)

def get_db_connection():
    """Подключение к базе данных"""
    database_url = os.environ.get('DATABASE_URL')
    if database_url:
        return psycopg2.connect(database_url)
    else:
        # Fallback для локального тестирования
        return psycopg2.connect(
            host=os.environ.get('DATABASE_HOST', 'localhost'),
            database=os.environ.get('DATABASE_NAME', 'postgres'),
            user=os.environ.get('DATABASE_USER', 'postgres'),
            password=os.environ.get('DATABASE_PASSWORD', ''),
            port=os.environ.get('DATABASE_PORT', '5432')
        )

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Обработчик аутентификации пользователей
    Поддерживает: регистрацию, вход, выход, проверку сессии
    """
    
    method = event.get('httpMethod', 'GET')
    
    # CORS headers
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Session-Token',
        'Access-Control-Max-Age': '86400'
    }
    
    # Handle OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': ''
        }
    
    try:
        path = event.get('path', '/')
        body_data = {}
        
        if event.get('body'):
            body_data = json.loads(event['body'])
        
        # Роутинг
        if method == 'POST' and path.endswith('/register'):
            return register_user(body_data, cors_headers)
        elif method == 'POST' and path.endswith('/login'):
            return login_user(body_data, cors_headers)
        elif method == 'POST' and path.endswith('/logout'):
            return logout_user(event, cors_headers)
        elif method == 'GET' and path.endswith('/profile'):
            return get_user_profile(event, cors_headers)
        elif method == 'PUT' and path.endswith('/profile'):
            return update_user_profile(event, body_data, cors_headers)
        else:
            return {
                'statusCode': 404,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Endpoint not found'})
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': f'Server error: {str(e)}'})
        }

def register_user(data: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    """Регистрация нового пользователя"""
    
    # Валидация данных
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    name = data.get('name', '').strip()
    
    if not email or not validate_email(email):
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Некорректный email'})
        }
    
    if len(password) < 6:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Пароль должен быть не менее 6 символов'})
        }
    
    if not name or len(name) < 2:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Имя должно быть не менее 2 символов'})
        }
    
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Проверяем, что пользователь не существует
                cur.execute("SELECT id FROM users WHERE email = %s", (email,))
                if cur.fetchone():
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Пользователь с таким email уже существует'})
                    }
                
                # Создаем пользователя
                password_hash = hash_password(password)
                verification_token = secrets.token_urlsafe(32)
                
                cur.execute("""
                    INSERT INTO users (email, password_hash, name, verification_token, is_verified)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING id, email, name, subscription_type, role, created_at
                """, (email, password_hash, name, verification_token, True))  # Сразу верифицируем для простоты
                
                user = cur.fetchone()
                conn.commit()
                
                # Создаем сессию
                session_token = generate_session_token()
                expires_at = datetime.utcnow() + timedelta(days=30)
                
                cur.execute("""
                    INSERT INTO user_sessions (user_id, session_token, expires_at)
                    VALUES (%s, %s, %s)
                """, (user['id'], session_token, expires_at))
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'body': json.dumps({
                        'message': 'Пользователь успешно зарегистрирован',
                        'session_token': session_token,
                        'user': dict(user)
                    })
                }
                
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Ошибка регистрации: {str(e)}'})
        }

def login_user(data: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    """Вход пользователя"""
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Email и пароль обязательны'})
        }
    
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Находим пользователя
                cur.execute("""
                    SELECT id, email, password_hash, name, subscription_type, role, is_verified
                    FROM users WHERE email = %s
                """, (email,))
                
                user = cur.fetchone()
                if not user or not verify_password(password, user['password_hash']):
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Неверный email или пароль'})
                    }
                
                if not user['is_verified']:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Аккаунт не подтвержден'})
                    }
                
                # Создаем новую сессию
                session_token = generate_session_token()
                expires_at = datetime.utcnow() + timedelta(days=30)
                
                cur.execute("""
                    INSERT INTO user_sessions (user_id, session_token, expires_at)
                    VALUES (%s, %s, %s)
                """, (user['id'], session_token, expires_at))
                conn.commit()
                
                # Удаляем пароль из ответа
                user_data = dict(user)
                del user_data['password_hash']
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({
                        'message': 'Успешный вход',
                        'session_token': session_token,
                        'user': user_data
                    })
                }
                
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Ошибка входа: {str(e)}'})
        }

def logout_user(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    """Выход пользователя"""
    
    session_token = event.get('headers', {}).get('X-Session-Token') or event.get('headers', {}).get('x-session-token')
    
    if not session_token:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Токен сессии не предоставлен'})
        }
    
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                # Удаляем сессию
                cur.execute("UPDATE user_sessions SET expires_at = CURRENT_TIMESTAMP WHERE session_token = %s", (session_token,))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'message': 'Успешный выход'})
                }
                
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Ошибка выхода: {str(e)}'})
        }

def get_user_profile(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    """Получение профиля пользователя"""
    
    session_token = event.get('headers', {}).get('X-Session-Token') or event.get('headers', {}).get('x-session-token')
    
    if not session_token:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'error': 'Требуется авторизация'})
        }
    
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Проверяем сессию и получаем пользователя
                cur.execute("""
                    SELECT u.id, u.email, u.name, u.avatar_url, u.subscription_type, u.role, u.created_at
                    FROM users u
                    JOIN user_sessions s ON u.id = s.user_id
                    WHERE s.session_token = %s AND s.expires_at > CURRENT_TIMESTAMP
                """, (session_token,))
                
                user = cur.fetchone()
                if not user:
                    return {
                        'statusCode': 401,
                        'headers': headers,
                        'body': json.dumps({'error': 'Недействительная сессия'})
                    }
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'user': dict(user)})
                }
                
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Ошибка получения профиля: {str(e)}'})
        }

def update_user_profile(event: Dict[str, Any], data: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    """Обновление профиля пользователя"""
    
    session_token = event.get('headers', {}).get('X-Session-Token') or event.get('headers', {}).get('x-session-token')
    
    if not session_token:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'error': 'Требуется авторизация'})
        }
    
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Проверяем сессию
                cur.execute("""
                    SELECT user_id FROM user_sessions 
                    WHERE session_token = %s AND expires_at > CURRENT_TIMESTAMP
                """, (session_token,))
                
                session = cur.fetchone()
                if not session:
                    return {
                        'statusCode': 401,
                        'headers': headers,
                        'body': json.dumps({'error': 'Недействительная сессия'})
                    }
                
                # Обновляем профиль
                updates = []
                params = []
                
                if 'name' in data and data['name'].strip():
                    updates.append("name = %s")
                    params.append(data['name'].strip())
                
                if 'avatar_url' in data:
                    updates.append("avatar_url = %s")
                    params.append(data['avatar_url'])
                
                if not updates:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Нет данных для обновления'})
                    }
                
                updates.append("updated_at = CURRENT_TIMESTAMP")
                params.append(session['user_id'])
                
                cur.execute(f"""
                    UPDATE users SET {', '.join(updates)}
                    WHERE id = %s
                    RETURNING id, email, name, avatar_url, subscription_type, role
                """, params)
                
                user = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({
                        'message': 'Профиль обновлен',
                        'user': dict(user)
                    })
                }
                
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Ошибка обновления профиля: {str(e)}'})
        }