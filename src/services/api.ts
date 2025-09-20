/**
 * API сервис для работы с бэкендом
 */

import funcUrls from '/backend/func2url.json';

export interface User {
  id: number;
  email: string;
  name: string;
  avatar_url?: string;
  subscription_type: 'free' | 'pro' | 'premium';
  role: 'user' | 'admin';
  created_at: string;
}

export interface Panorama {
  id: number;
  title: string;
  description?: string;
  image_url: string;
  thumbnail_url?: string;
  file_size: number;
  file_type: string;
  is_public: boolean;
  is_premium: boolean;
  views_count: number;
  likes_count: number;
  tags: string[];
  created_at: string;
  category_name?: string;
  category_color?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
}

class ApiService {
  private authUrl = funcUrls.auth;
  private uploadUrl = funcUrls.upload;
  private sessionToken: string | null = null;

  constructor() {
    // Загружаем токен из localStorage при инициализации
    this.sessionToken = localStorage.getItem('session_token');
  }

  private getHeaders(includeAuth: boolean = false): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.sessionToken) {
      headers['X-Session-Token'] = this.sessionToken;
    }

    return headers;
  }

  private async request(url: string, options: RequestInit = {}): Promise<any> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Аутентификация
  async register(email: string, password: string, name: string): Promise<{ user: User; session_token: string }> {
    const data = await this.request(`${this.authUrl}/register`, {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });

    this.sessionToken = data.session_token;
    localStorage.setItem('session_token', this.sessionToken!);

    return data;
  }

  async login(email: string, password: string): Promise<{ user: User; session_token: string }> {
    const data = await this.request(`${this.authUrl}/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.sessionToken = data.session_token;
    localStorage.setItem('session_token', this.sessionToken!);

    return data;
  }

  async logout(): Promise<void> {
    if (this.sessionToken) {
      try {
        await this.request(`${this.authUrl}/logout`, {
          method: 'POST',
          headers: this.getHeaders(true),
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    this.sessionToken = null;
    localStorage.removeItem('session_token');
  }

  async getProfile(): Promise<{ user: User }> {
    return this.request(`${this.authUrl}/profile`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });
  }

  async updateProfile(updates: { name?: string; avatar_url?: string }): Promise<{ user: User }> {
    return this.request(`${this.authUrl}/profile`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(updates),
    });
  }

  // Панорамы
  async uploadPanorama(file: File, metadata: {
    title: string;
    description?: string;
    category_id?: number;
    tags?: string[];
    is_public?: boolean;
  }): Promise<{ panorama: Panorama; remaining_uploads: number }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          const fileData = reader.result as string;
          const base64Data = fileData.split(',')[1]; // Убираем data:image/...;base64, префикс

          const data = await this.request(`${this.uploadUrl}/upload`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify({
              ...metadata,
              file_data: base64Data,
              file_name: file.name,
              file_type: file.type,
            }),
          });

          resolve(data);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Ошибка чтения файла'));
      reader.readAsDataURL(file);
    });
  }

  async getMyPanoramas(): Promise<{
    panoramas: Panorama[];
    total: number;
    limit: number;
    remaining: number;
  }> {
    return this.request(`${this.uploadUrl}/my-panoramas`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });
  }

  async deletePanorama(panoramaId: number): Promise<{ message: string }> {
    return this.request(`${this.uploadUrl}/${panoramaId}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });
  }

  // Утилиты
  isAuthenticated(): boolean {
    return !!this.sessionToken;
  }

  getSessionToken(): string | null {
    return this.sessionToken;
  }
}

export const apiService = new ApiService();
export default apiService;