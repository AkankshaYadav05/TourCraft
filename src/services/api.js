const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'An error occurred');
    }

    return response.json();
  }

  // Auth methods
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Tour methods
  async getTours() {
    return this.request('/tours');
  }

  async getTour(id) {
    return this.request(`/tours/${id}`);
  }

  async getPublicTour(shareUrl) {
    return this.request(`/tours/public/${shareUrl}`);
  }

  async createTour(tourData) {
    return this.request('/tours', {
      method: 'POST',
      body: JSON.stringify(tourData),
    });
  }

  async updateTour(id, tourData) {
    return this.request(`/tours/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tourData),
    });
  }

  async deleteTour(id) {
    return this.request(`/tours/${id}`, { method: 'DELETE' });
  }

  async toggleTourVisibility(id) {
    return this.request(`/tours/${id}/visibility`, { method: 'PATCH' });
  }

  async uploadScreenshot(file) {
    const formData = new FormData();
    formData.append('screenshot', file);

    return fetch(`${API_BASE_URL}/tours/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    }).then(response => {
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      return response.json();
    });
  }

  async incrementClick(shareUrl) {
    return this.request(`/tours/${shareUrl}/click`, { method: 'POST' });
  }

  // Analytics methods
  async getAnalytics() {
    return this.request('/analytics');
  }
}

export const apiService = new ApiService();