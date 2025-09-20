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
    const data = await this.request(`${this.authUrl}`, {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });

    this.sessionToken = data.session_token;
    localStorage.setItem('session_token', this.sessionToken!);

    return data;
  }

  async login(email: string, password: string): Promise<{ user: User; session_token: string }> {
    const data = await this.request(`${this.authUrl}`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.sessionToken = data.session_token;
    localStorage.setItem('session_token', this.sessionToken!);

    return data;
  }

  async oauthLogin(provider: string, oauthData: {
    oauth_id: string;
    email: string;
    name: string;
    avatar_url?: string;
  }): Promise<{ user: User; session_token: string; is_new_user: boolean }> {
    const data = await this.request(`${this.authUrl}`, {
      method: 'POST',
      body: JSON.stringify({
        provider,
        ...oauthData
      }),
    });

    this.sessionToken = data.session_token;
    localStorage.setItem('session_token', this.sessionToken!);

    return data;
  }

  async logout(): Promise<void> {
    if (this.sessionToken) {
      try {
        await this.request(`${this.authUrl}`, {
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
    return this.request(`${this.authUrl}`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });
  }

  async updateProfile(updates: { name?: string; avatar_url?: string }): Promise<{ user: User }> {
    return this.request(`${this.authUrl}`, {
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

          const data = await this.request(`${this.uploadUrl}`, {
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
    return this.request(`${this.uploadUrl}`, {
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

  // OAuth провайдеры
  initGoogleAuth(): void {
    // Настройка Google OAuth
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => {
      (window as any).google?.accounts.id.initialize({
        client_id: '869752367387-v6d2pv4bv1u2lhq6g5o6m0qf6v9s1q2l.apps.googleusercontent.com', // Demo client ID
        callback: this.handleGoogleResponse.bind(this)
      });
    };
    document.head.appendChild(script);
  }

  private handleGoogleResponse(response: any): void {
    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      this.oauthLogin('google', {
        oauth_id: payload.sub,
        email: payload.email,
        name: payload.name,
        avatar_url: payload.picture
      });
    } catch (error) {
      console.error('Google OAuth error:', error);
    }
  }

  googleLogin(): void {
    if ((window as any).google?.accounts.id) {
      (window as any).google.accounts.id.prompt();
    } else {
      console.error('Google OAuth not initialized');
    }
  }

  yandexLogin(): void {
    // Яндекс OAuth
    const clientId = 'demo_client_id';
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/yandex');
    const authUrl = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=login:email%20login:info`;
    
    window.location.href = authUrl;
  }

  vkLogin(): void {
    // VK OAuth
    const clientId = 'demo_client_id';
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/vk');
    const authUrl = `https://oauth.vk.com/authorize?client_id=${clientId}&display=popup&redirect_uri=${redirectUri}&scope=email&response_type=code&v=5.131`;
    
    window.location.href = authUrl;
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

// Инициализируем OAuth провайдеры при загрузке
if (typeof window !== 'undefined') {
  apiService.initGoogleAuth();
}

export default apiService;