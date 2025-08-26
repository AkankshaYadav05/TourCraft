const API_BASE_URL = 'https://tourcraft-eiaz.onrender.com';

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

    let response;
    try {
      response = await fetch(url, config);
    } catch (err) {
      throw new Error('Network error or server not reachable');
    }

    if (!response.ok) {
      let errorMsg = `Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.error || errorMsg;
      } catch {
        // response not JSON
      }
      throw new Error(errorMsg);
    }

    // handle empty response (204 No Content)
    if (response.status === 204) return null;

    try {
      return await response.json();
    } catch {
      return null; // fallback if response body is empty
    }
  }

  // Auth methods
  async register(userData) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/api/auth/logout', { method: 'POST' });
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
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

    const response = await fetch(`${API_BASE_URL}/tours/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    try {
      return await response.json();
    } catch {
      return null;
    }
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
