const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const API_TIMEOUT = 60000; // Increased to 60 seconds for slower connections

const timeout = (ms: number) => new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Request timeout')), ms)
);

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('rupantar-admin-auth') 
      ? JSON.parse(localStorage.getItem('rupantar-admin-auth') || '{}').state?.token
      : null
    : null;
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const adminApi = {
  async get(endpoint: string) {
    try {
      const response = await Promise.race([
        fetch(`${API_URL}/admin${endpoint}`, {
          headers: getAuthHeaders(),
        }),
        timeout(API_TIMEOUT) as Promise<Response>
      ]);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          error: `API request failed: ${response.status} ${response.statusText}` 
        }));
        throw new Error(error.error || `API request failed: ${response.status}`);
      }
      return response.json();
    } catch (error: any) {
      if (error.message === 'Request timeout') {
        throw new Error('Request timeout. Please check your connection and try again.');
      }
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to server. Please check your connection.');
      }
      throw error;
    }
  },

  async post(endpoint: string, data: any) {
    try {
      const response = await Promise.race([
        fetch(`${API_URL}/admin${endpoint}`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        }),
        timeout(API_TIMEOUT) as Promise<Response>
      ]);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          error: `API request failed: ${response.status} ${response.statusText}` 
        }));
        throw new Error(error.error || `API request failed: ${response.status}`);
      }
      return response.json();
    } catch (error: any) {
      if (error.message === 'Request timeout') {
        throw new Error('Request timeout. Please check your connection and try again.');
      }
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to server. Please check your connection.');
      }
      throw error;
    }
  },

  async put(endpoint: string, data: any) {
    try {
      const response = await Promise.race([
        fetch(`${API_URL}/admin${endpoint}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        }),
        timeout(API_TIMEOUT) as Promise<Response>
      ]);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          error: `API request failed: ${response.status} ${response.statusText}` 
        }));
        throw new Error(error.error || `API request failed: ${response.status}`);
      }
      return response.json();
    } catch (error: any) {
      if (error.message === 'Request timeout') {
        throw new Error('Request timeout. Please check your connection and try again.');
      }
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to server. Please check your connection.');
      }
      throw error;
    }
  },

  async delete(endpoint: string) {
    try {
      const response = await Promise.race([
        fetch(`${API_URL}/admin${endpoint}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }),
        timeout(API_TIMEOUT) as Promise<Response>
      ]);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          error: `API request failed: ${response.status} ${response.statusText}` 
        }));
        throw new Error(error.error || `API request failed: ${response.status}`);
      }
      return response.json();
    } catch (error: any) {
      if (error.message === 'Request timeout') {
        throw new Error('Request timeout. Please check your connection and try again.');
      }
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to server. Please check your connection.');
      }
      throw error;
    }
  },
};

// Admin-specific API methods
export const adminAuthApi = {
  login: (email: string, password: string) => 
    adminApi.post('/auth/login', { email, password }),
  syncFirebaseUsers: () => adminApi.post('/auth/syncAllFirebaseUsers', {}),
};

export const adminUsersApi = {
  getAll: (filters?: any) => adminApi.get(`/users${filters ? `?${new URLSearchParams(filters).toString()}` : ''}`),
  getById: (id: string) => adminApi.get(`/users/${id}`),
  create: (data: any) => adminApi.post(`/users`, data),
  update: (id: string, data: any) => adminApi.put(`/users/${id}`, data),
  promote: (id: string) => adminApi.post(`/users/${id}/promote`, {}),
  ban: (id: string) => adminApi.post(`/users/${id}/ban`, {}),
  unban: (id: string) => adminApi.post(`/users/${id}/unban`, {}),
  verify: (id: string) => adminApi.post(`/users/${id}/verify`, {}),
  addPoints: (id: string, points: number) => adminApi.post(`/users/${id}/points`, { points }),
  delete: (id: string) => adminApi.delete(`/users/${id}`),
};

export const adminTemplatesApi = {
  getAll: (filters?: any) => adminApi.get(`/templates${filters ? `?${new URLSearchParams(filters).toString()}` : ''}`),
  getById: (id: string) => adminApi.get(`/templates/${id}`),
  create: (data: any) => adminApi.post(`/templates`, data),
  approve: (id: string) => adminApi.post(`/templates/${id}/approve`, {}),
  reject: (id: string, reason?: string) => adminApi.post(`/templates/${id}/reject`, { reason }),
  delete: (id: string) => adminApi.delete(`/templates/${id}`),
  bulkApprove: (ids: string[]) => adminApi.post('/templates/bulk/approve', { ids }),
  bulkReject: (ids: string[], reason?: string) => adminApi.post('/templates/bulk/reject', { ids, reason }),
  bulkDelete: (ids: string[]) => adminApi.post('/templates/bulk/delete', { ids }),
  uploadDemoImage: async (file: File) => {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('rupantar-admin-auth') 
        ? JSON.parse(localStorage.getItem('rupantar-admin-auth') || '{}').state?.token
        : null
      : null

    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch(`${API_URL}/admin/upload/template-demo`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: `API request failed: ${response.status} ${response.statusText}` }))
      throw new Error(error.error || `API request failed: ${response.status}`)
    }
    return response.json()
  },
};

export const adminCreatorsApi = {
  getAll: (filters?: any) => adminApi.get(`/creators${filters ? `?${new URLSearchParams(filters).toString()}` : ''}`),
  getById: (id: string) => adminApi.get(`/creators/${id}`),
  approve: (id: string) => adminApi.post(`/creators/${id}/approve`, {}),
  reject: (id: string, reason?: string) => adminApi.post(`/creators/${id}/reject`, { reason }),
  ban: (id: string) => adminApi.post(`/creators/${id}/ban`, {}),
  unban: (id: string) => adminApi.post(`/creators/${id}/unban`, {}),
  verify: (id: string) => adminApi.post(`/creators/${id}/verify`, {}),
  processWithdrawal: (id: string, withdrawalId: string) => adminApi.post(`/creators/${id}/withdrawals/${withdrawalId}/process`, {}),
};

export const adminTransactionsApi = {
  getAll: (filters?: any) => adminApi.get(`/transactions${filters ? `?${new URLSearchParams(filters).toString()}` : ''}`),
  getById: (id: string) => adminApi.get(`/transactions/${id}`),
  refund: (id: string) => adminApi.post(`/transactions/${id}/refund`, {}),
  export: (filters?: any) => adminApi.get(`/transactions/export${filters ? `?${new URLSearchParams(filters).toString()}` : ''}`),
};

export const adminAnalyticsApi = {
  getDashboard: () => adminApi.get('/analytics/dashboard'),
  getRevenue: (period: string) => adminApi.get(`/analytics/revenue?period=${period}`),
  getUserGrowth: (period: string) => adminApi.get(`/analytics/users?period=${period}`),
  getTemplatePerformance: () => adminApi.get('/analytics/templates'),
  getCreatorPerformance: () => adminApi.get('/analytics/creators'),
};

export const adminSettingsApi = {
  get: () => adminApi.get('/settings'),
  update: (settings: any) => adminApi.put('/settings', settings),
};

export const adminSupportApi = {
  getAll: (filters?: any) => adminApi.get(`/support${filters ? `?${new URLSearchParams(filters).toString()}` : ''}`),
  getById: (id: string) => adminApi.get(`/support/${id}`),
  assign: (id: string, adminId: string) => adminApi.post(`/support/${id}/assign`, { adminId }),
  updateStatus: (id: string, status: string) => adminApi.post(`/support/${id}/status`, { status }),
  addResponse: (id: string, message: string) => adminApi.post(`/support/${id}/response`, { message }),
  close: (id: string) => adminApi.post(`/support/${id}/close`, {}),
};

// AI Configuration API (Admin)
export const adminAIConfigApi = {
  getAll: () => adminApi.get(`/ai-config`),
  getActive: () => adminApi.get(`/ai-config/active`),
  create: (data: any) => adminApi.post(`/ai-config`, data),
  activate: (id: string) => adminApi.post(`/ai-config/${id}/activate`, {}),
  test: (id: string) => adminApi.post(`/ai-config/${id}/test`, {}),
  delete: (id: string) => adminApi.delete(`/ai-config/${id}`),
};

