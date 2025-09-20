"""
Система загрузки и управления файлами панорам
"""

import json
import base64
import secrets
import os
import hashlib
from typing import Dict, Any, Optional
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

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

def verify_session(session_token: str) -> Optional[Dict[str, Any]]:
    """Проверка сессии пользователя"""
    if not session_token:
        return None
    
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT u.id, u.email, u.name, u.subscription_type, u.role
                    FROM users u
                    JOIN user_sessions s ON u.id = s.user_id
                    WHERE s.session_token = %s AND s.expires_at > CURRENT_TIMESTAMP
                """, (session_token,))
                
                return cur.fetchone()
    except Exception:
        return None

def generate_file_id() -> str:
    """Генерация уникального ID файла"""
    return secrets.token_urlsafe(16)

def get_file_hash(file_data: bytes) -> str:
    """Получение хеша файла для дедупликации"""
    return hashlib.sha256(file_data).hexdigest()

def save_file_to_storage(file_data: bytes, file_name: str, file_type: str) -> str:
    """
    Сохранение файла в хранилище (в реальности это был бы S3 или другое облачное хранилище)
    Пока сохраняем как data URL для демонстрации
    """
    # В реальном проекте здесь был бы код загрузки в S3/Yandex Object Storage
    file_base64 = base64.b64encode(file_data).decode('utf-8')
    data_url = f"data:{file_type};base64,{file_base64}"
    return data_url

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Обработчик загрузки файлов
    Поддерживает: загрузку панорам, получение списка файлов, удаление
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
        path = event.get('path', '/')
        
        # Проверка авторизации
        session_token = event.get('headers', {}).get('X-Session-Token') or event.get('headers', {}).get('x-session-token')
        user = verify_session(session_token)
        
        if not user:
            return {
                'statusCode': 401,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Требуется авторизация'})
            }
        
        # Роутинг
        if method == 'POST' and path.endswith('/upload'):
            return upload_panorama(event, user, cors_headers)
        elif method == 'GET' and path.endswith('/my-panoramas'):
            return get_user_panoramas(user, cors_headers)
        elif method == 'DELETE':
            panorama_id = path.split('/')[-1]
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
        # Парсим данные
        body_data = json.loads(event.get('body', '{}'))
        
        title = body_data.get('title', '').strip()
        description = body_data.get('description', '').strip()
        category_id = body_data.get('category_id')
        file_data_base64 = body_data.get('file_data', '')
        file_name = body_data.get('file_name', '')
        file_type = body_data.get('file_type', '')
        tags = body_data.get('tags', [])
        is_public = body_data.get('is_public', True)
        
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
        
        # Декодируем файл
        try:
            file_data = base64.b64decode(file_data_base64)
        except Exception:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Некорректные данные файла'})
            }
        
        file_size = len(file_data)
        
        # Проверяем размер файла (максимум 50MB)
        if file_size > 50 * 1024 * 1024:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Файл слишком большой (максимум 50MB)'})
            }
        
        # Проверяем лимиты пользователя
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Считаем количество панорам пользователя
                cur.execute("SELECT COUNT(*) as count FROM panoramas WHERE user_id = %s", (user['id'],))
                user_panoramas_count = cur.fetchone()['count']
                
                # Лимиты по подписке
                max_panoramas = 5 if user['subscription_type'] == 'free' else 1000
                
                if user_panoramas_count >= max_panoramas:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({
                            'error': f'Достигнут лимит панорам ({max_panoramas}). Обновите подписку.',
                            'limit_reached': True
                        })
                    }
                
                # Проверяем дедупликацию по хешу
                file_hash = get_file_hash(file_data)
                cur.execute("SELECT id, title FROM panoramas WHERE metadata->>'file_hash' = %s AND user_id = %s", (file_hash, user['id']))
                existing = cur.fetchone()
                
                if existing:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({
                            'error': f'Этот файл уже загружен как "{existing["title"]}"',
                            'duplicate': True
                        })
                    }
                
                # Сохраняем файл
                image_url = save_file_to_storage(file_data, file_name, file_type)
                
                # Создаем запись в БД
                metadata = {
                    'file_hash': file_hash,
                    'original_name': file_name,
                    'upload_date': datetime.utcnow().isoformat()
                }
                
                cur.execute("""
                    INSERT INTO panoramas (
                        user_id, category_id, title, description, image_url, 
                        file_size, file_type, is_public, tags, metadata
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id, title, created_at
                """, (
                    user['id'], category_id, title, description, image_url,
                    file_size, file_type, is_public, tags, json.dumps(metadata)
                ))
                
                panorama = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'body': json.dumps({
                        'message': 'Панорама успешно загружена',
                        'panorama': {
                            'id': panorama['id'],
                            'title': panorama['title'],
                            'image_url': image_url,
                            'created_at': panorama['created_at'].isoformat()
                        },
                        'remaining_uploads': max_panoramas - user_panoramas_count - 1
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
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT p.id, p.title, p.description, p.image_url, p.thumbnail_url,
                           p.file_size, p.file_type, p.is_public, p.is_premium,
                           p.views_count, p.likes_count, p.tags, p.created_at,
                           c.name as category_name, c.color as category_color
                    FROM panoramas p
                    LEFT JOIN categories c ON p.category_id = c.id
                    WHERE p.user_id = %s
                    ORDER BY p.created_at DESC
                """, (user['id'],))
                
                panoramas = [dict(row) for row in cur.fetchall()]
                
                # Считаем лимиты
                max_panoramas = 5 if user['subscription_type'] == 'free' else 1000
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({
                        'panoramas': panoramas,
                        'total': len(panoramas),
                        'limit': max_panoramas,
                        'remaining': max_panoramas - len(panoramas)
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
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Проверяем принадлежность панорамы пользователю
                cur.execute("""
                    SELECT id, title, image_url FROM panoramas 
                    WHERE id = %s AND user_id = %s
                """, (panorama_id, user['id']))
                
                panorama = cur.fetchone()
                if not panorama:
                    return {
                        'statusCode': 404,
                        'headers': headers,
                        'body': json.dumps({'error': 'Панорама не найдена'})
                    }
                
                # Удаляем панораму (каскадно удалятся связанные записи)
                cur.execute("UPDATE panoramas SET image_url = NULL WHERE id = %s", (panorama_id,))
                conn.commit()
                
                # В реальном проекте здесь был бы код удаления файла из S3
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({
                        'message': f'Панорама "{panorama["title"]}" удалена'
                    })
                }
                
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Ошибка удаления: {str(e)}'})
        }