"""
Базовая система загрузки файлов для демонстрации
"""

import json
import base64
import secrets
from datetime import datetime
from typing import Dict, Any

# Временное хранилище (в реальности это была бы база данных)
PANORAMAS_STORAGE = {}
USERS_SESSIONS = {}

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Обработчик загрузки файлов
    """
    
    method = event.get('httpMethod', 'GET')
    
    # CORS headers
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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
        # Проверка авторизации
        session_token = event.get('headers', {}).get('X-Session-Token') or event.get('headers', {}).get('x-session-token')
        
        if not session_token:
            return {
                'statusCode': 401,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Требуется авторизация'})
            }
        
        # Имитируем проверку сессии (в реальности запрос к auth service)
        user = {
            'id': 1,
            'email': 'demo@example.com',
            'name': 'Demo User',
            'subscription_type': 'free'
        }
        
        # Простой роутинг
        if method == 'POST':
            return upload_panorama(event, user, cors_headers)
        elif method == 'GET':
            return get_user_panoramas(user, cors_headers)
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters', {}) or {}
            panorama_id = query_params.get('id', '')
            return delete_panorama(panorama_id, user, cors_headers)
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

def upload_panorama(event: Dict[str, Any], user: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    """Загрузка панорамы"""
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        
        title = body_data.get('title', '').strip()
        description = body_data.get('description', '').strip()
        file_data_base64 = body_data.get('file_data', '')
        file_name = body_data.get('file_name', '')
        file_type = body_data.get('file_type', '')
        
        # Валидация
        if not title:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Название обязательно'})
            }
        
        if not file_data_base64:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Файл не предоставлен'})
            }
        
        if not file_type.startswith('image/'):
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Разрешены только изображения'})
            }
        
        # Проверяем лимиты
        user_panoramas = [p for p in PANORAMAS_STORAGE.values() if p['user_id'] == user['id']]
        max_panoramas = 5 if user['subscription_type'] == 'free' else 1000
        
        if len(user_panoramas) >= max_panoramas:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({
                    'error': f'Достигнут лимит панорам ({max_panoramas}). Обновите подписку.',
                    'limit_reached': True
                })
            }
        
        # Создаем панораму
        panorama_id = len(PANORAMAS_STORAGE) + 1
        image_url = f"data:{file_type};base64,{file_data_base64}"
        
        panorama_data = {
            'id': panorama_id,
            'user_id': user['id'],
            'title': title,
            'description': description,
            'image_url': image_url,
            'file_size': len(base64.b64decode(file_data_base64)),
            'file_type': file_type,
            'is_public': True,
            'is_premium': False,
            'views_count': 0,
            'likes_count': 0,
            'tags': [],
            'created_at': datetime.utcnow().isoformat()
        }
        
        PANORAMAS_STORAGE[panorama_id] = panorama_data
        
        return {
            'statusCode': 201,
            'headers': headers,
            'body': json.dumps({
                'message': 'Панорама успешно загружена',
                'panorama': {
                    'id': panorama_id,
                    'title': title,
                    'image_url': image_url,
                    'created_at': panorama_data['created_at']
                },
                'remaining_uploads': max_panoramas - len(user_panoramas) - 1
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Ошибка загрузки: {str(e)}'})
        }

def get_user_panoramas(user: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    """Получение панорам пользователя"""
    
    try:
        user_panoramas = [p for p in PANORAMAS_STORAGE.values() if p['user_id'] == user['id']]
        max_panoramas = 5 if user['subscription_type'] == 'free' else 1000
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'panoramas': user_panoramas,
                'total': len(user_panoramas),
                'limit': max_panoramas,
                'remaining': max_panoramas - len(user_panoramas)
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Ошибка получения панорам: {str(e)}'})
        }

def delete_panorama(panorama_id: str, user: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    """Удаление панорамы"""
    
    try:
        panorama_id = int(panorama_id)
    except (ValueError, TypeError):
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Некорректный ID панорамы'})
        }
    
    panorama = PANORAMAS_STORAGE.get(panorama_id)
    if not panorama:
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({'error': 'Панорама не найдена'})
        }
    
    if panorama['user_id'] != user['id']:
        return {
            'statusCode': 403,
            'headers': headers,
            'body': json.dumps({'error': 'Доступ запрещен'})
        }
    
    title = panorama['title']
    del PANORAMAS_STORAGE[panorama_id]
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'message': f'Панорама "{title}" удалена'
        })
    }