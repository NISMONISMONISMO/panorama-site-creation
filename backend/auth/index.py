"""
Базовая система аутентификации для демонстрации
"""

import json
import hashlib
import secrets
import re
from datetime import datetime, timedelta
from typing import Dict, Any

# Временное хранилище пользователей в памяти (для демо)
USERS_STORAGE = {}
SESSIONS_STORAGE = {}

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Обработчик аутентификации пользователей
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
        body_data = {}
        
        if event.get('body'):
            body_data = json.loads(event['body'])
        
        # Простой роутинг по данным в body
        if method == 'POST':
            if 'provider' in body_data:  # OAuth запрос
                return handle_oauth(body_data, cors_headers)
            elif 'email' in body_data and 'password' in body_data and 'name' in body_data:  # Регистрация
                return register_user(body_data, cors_headers)
            elif 'email' in body_data and 'password' in body_data:  # Вход
                return login_user(body_data, cors_headers)
            else:  # Выход
                return logout_user(event, cors_headers)
        elif method == 'GET':
            return get_user_profile(event, cors_headers)
        elif method == 'PUT':
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

def hash_password(password: str) -> str:
    """Простое хеширование пароля"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token() -> str:
    """Генерация токена"""
    return secrets.token_urlsafe(32)

def register_user(data: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    """Регистрация нового пользователя"""
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    name = data.get('name', '').strip()
    
    if not email or not password or not name:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Email, пароль и имя обязательны'})
        }
    
    if email in USERS_STORAGE:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Пользователь с таким email уже существует'})
        }
    
    # Создаем пользователя
    user_id = len(USERS_STORAGE) + 1
    password_hash = hash_password(password)
    
    user_data = {
        'id': user_id,
        'email': email,
        'name': name,
        'password_hash': password_hash,
        'subscription_type': 'free',
        'role': 'user',
        'created_at': datetime.utcnow().isoformat(),
        'avatar_url': f'https://api.dicebear.com/7.x/avataaars/svg?seed={email}'
    }
    
    USERS_STORAGE[email] = user_data
    
    # Создаем сессию
    session_token = generate_token()
    SESSIONS_STORAGE[session_token] = {
        'user_id': user_id,
        'email': email,
        'expires_at': (datetime.utcnow() + timedelta(days=30)).isoformat()
    }
    
    # Убираем пароль из ответа
    response_user = {k: v for k, v in user_data.items() if k != 'password_hash'}
    
    return {
        'statusCode': 201,
        'headers': headers,
        'body': json.dumps({
            'message': 'Пользователь успешно зарегистрирован',
            'session_token': session_token,
            'user': response_user
        })
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
    
    user = USERS_STORAGE.get(email)
    if not user or user['password_hash'] != hash_password(password):
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Неверный email или пароль'})
        }
    
    # Создаем новую сессию
    session_token = generate_token()
    SESSIONS_STORAGE[session_token] = {
        'user_id': user['id'],
        'email': email,
        'expires_at': (datetime.utcnow() + timedelta(days=30)).isoformat()
    }
    
    # Убираем пароль из ответа
    response_user = {k: v for k, v in user.items() if k != 'password_hash'}
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'message': 'Успешный вход',
            'session_token': session_token,
            'user': response_user
        })
    }

def logout_user(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    """Выход пользователя"""
    
    session_token = event.get('headers', {}).get('X-Session-Token') or event.get('headers', {}).get('x-session-token')
    
    if session_token and session_token in SESSIONS_STORAGE:
        del SESSIONS_STORAGE[session_token]
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'message': 'Успешный выход'})
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
    
    session = SESSIONS_STORAGE.get(session_token)
    if not session:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'error': 'Недействительная сессия'})
        }
    
    # Проверяем срок действия
    expires_at = datetime.fromisoformat(session['expires_at'])
    if expires_at < datetime.utcnow():
        del SESSIONS_STORAGE[session_token]
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'error': 'Сессия истекла'})
        }
    
    user = USERS_STORAGE.get(session['email'])
    if not user:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'error': 'Пользователь не найден'})
        }
    
    # Убираем пароль из ответа
    response_user = {k: v for k, v in user.items() if k != 'password_hash'}
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'user': response_user})
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
    
    session = SESSIONS_STORAGE.get(session_token)
    if not session:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'error': 'Недействительная сессия'})
        }
    
    user = USERS_STORAGE.get(session['email'])
    if not user:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'error': 'Пользователь не найден'})
        }
    
    # Обновляем профиль
    if 'name' in data:
        user['name'] = data['name'].strip()
    if 'avatar_url' in data:
        user['avatar_url'] = data['avatar_url']
    
    # Убираем пароль из ответа
    response_user = {k: v for k, v in user.items() if k != 'password_hash'}
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'message': 'Профиль обновлен',
            'user': response_user
        })
    }

def handle_oauth(data: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    """Обработка OAuth аутентификации"""
    
    provider = data.get('provider', '').lower()
    oauth_id = data.get('oauth_id', '')
    email = data.get('email', '').strip().lower()
    name = data.get('name', '').strip()
    avatar_url = data.get('avatar_url', '')
    
    if not provider or not email or not name:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Недостаточно данных для OAuth'})
        }
    
    # Ищем существующего пользователя
    user = USERS_STORAGE.get(email)
    is_new_user = user is None
    
    if not user:
        # Создаем нового пользователя
        user_id = len(USERS_STORAGE) + 1
        user = {
            'id': user_id,
            'email': email,
            'name': name,
            'password_hash': hash_password(secrets.token_urlsafe(32)),  # Случайный пароль
            'subscription_type': 'free',
            'role': 'user',
            'created_at': datetime.utcnow().isoformat(),
            'avatar_url': avatar_url or f'https://api.dicebear.com/7.x/avataaars/svg?seed={email}'
        }
        USERS_STORAGE[email] = user
    else:
        # Обновляем аватар если нужно
        if avatar_url and not user.get('avatar_url'):
            user['avatar_url'] = avatar_url
    
    # Создаем сессию
    session_token = generate_token()
    SESSIONS_STORAGE[session_token] = {
        'user_id': user['id'],
        'email': email,
        'expires_at': (datetime.utcnow() + timedelta(days=30)).isoformat()
    }
    
    # Убираем пароль из ответа
    response_user = {k: v for k, v in user.items() if k != 'password_hash'}
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'message': 'OAuth аутентификация успешна',
            'session_token': session_token,
            'user': response_user,
            'is_new_user': is_new_user
        })
    }