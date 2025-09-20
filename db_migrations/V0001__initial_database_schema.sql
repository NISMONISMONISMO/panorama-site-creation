-- Создание таблиц для полноценной системы панорам

-- Таблица пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    subscription_type VARCHAR(50) DEFAULT 'free',
    subscription_expires_at TIMESTAMP,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_expires_at TIMESTAMP
);

-- Таблица категорий панорам
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(50),
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица панорам
CREATE TABLE panoramas (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    category_id INTEGER,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(255) NOT NULL,
    thumbnail_url VARCHAR(255),
    file_size INTEGER,
    file_type VARCHAR(50),
    is_public BOOLEAN DEFAULT true,
    is_premium BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    downloads_count INTEGER DEFAULT 0,
    tags TEXT[],
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица виртуальных туров
CREATE TABLE tours (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(255),
    is_public BOOLEAN DEFAULT true,
    is_premium BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    starting_scene_id INTEGER,
    settings JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица сцен тура
CREATE TABLE tour_scenes (
    id SERIAL PRIMARY KEY,
    tour_id INTEGER,
    panorama_id INTEGER,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scene_order INTEGER NOT NULL,
    settings JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица хотспотов
CREATE TABLE hotspots (
    id SERIAL PRIMARY KEY,
    scene_id INTEGER,
    target_scene_id INTEGER,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    hotspot_type VARCHAR(50) DEFAULT 'navigation',
    position_x FLOAT NOT NULL,
    position_y FLOAT NOT NULL,
    position_z FLOAT NOT NULL,
    icon VARCHAR(50) DEFAULT 'Navigation',
    color VARCHAR(50),
    action_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица лайков панорам
CREATE TABLE panorama_likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    panorama_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, panorama_id)
);

-- Таблица лайков туров
CREATE TABLE tour_likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    tour_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tour_id)
);

-- Таблица сессий пользователей
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для производительности
CREATE INDEX idx_panoramas_user_id ON panoramas(user_id);
CREATE INDEX idx_panoramas_category_id ON panoramas(category_id);
CREATE INDEX idx_panoramas_created_at ON panoramas(created_at DESC);
CREATE INDEX idx_panoramas_public ON panoramas(is_public, created_at DESC);
CREATE INDEX idx_tours_user_id ON tours(user_id);
CREATE INDEX idx_tour_scenes_tour_id ON tour_scenes(tour_id, scene_order);
CREATE INDEX idx_hotspots_scene_id ON hotspots(scene_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);