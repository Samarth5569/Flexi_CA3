const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Universal HTTP request handler
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  const token = localStorage.getItem('mealmate_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // If network error occurred where server is unreachable
    if (!error.status) {
      error.message = error.message || 'Cannot connect to server. Please verify backend is running.';
    }
    throw error;
  }
}

// Authentication Service
export const authAPI = {
  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: userData
    }),

  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: credentials
    }),

  getMe: () =>
    request('/auth/me', {
      method: 'GET'
    }),

  updateProfile: (profileData) =>
    request('/auth/profile', {
      method: 'PUT',
      body: profileData
    })
};

// Recipe Service
export const recipeAPI = {
  getRecipes: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.difficulty && params.difficulty !== 'All') query.append('difficulty', params.difficulty);
    if (params.isFavorite !== undefined && params.isFavorite !== '') query.append('isFavorite', params.isFavorite);
    if (params.sort) query.append('sort', params.sort);
    
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/recipes${queryString}`);
  },

  getRecipeById: (id) =>
    request(`/recipes/${id}`),

  createRecipe: (recipeData) =>
    request('/recipes', {
      method: 'POST',
      body: recipeData
    }),

  updateRecipe: (id, recipeData) =>
    request(`/recipes/${id}`, {
      method: 'PUT',
      body: recipeData
    }),

  deleteRecipe: (id) =>
    request(`/recipes/${id}`, {
      method: 'DELETE'
    }),

  toggleFavorite: (id) =>
    request(`/recipes/${id}/favorite`, {
      method: 'PATCH'
    })
};

// Meal Plan Service
export const mealPlanAPI = {
  getMealPlans: (params = {}) => {
    const query = new URLSearchParams();
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.mealType) query.append('mealType', params.mealType);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/meal-plans${queryString}`);
  },

  getMealPlanById: (id) =>
    request(`/meal-plans/${id}`),

  createMealPlan: (planData) =>
    request('/meal-plans', {
      method: 'POST',
      body: planData
    }),

  updateMealPlan: (id, planData) =>
    request(`/meal-plans/${id}`, {
      method: 'PUT',
      body: planData
    }),

  deleteMealPlan: (id) =>
    request(`/meal-plans/${id}`, {
      method: 'DELETE'
    })
};

// Grocery Service
export const groceryAPI = {
  getGroceryItems: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/grocery${queryString}`);
  },

  getGroceryItemById: (id) =>
    request(`/grocery/${id}`),

  createGroceryItem: (itemData) =>
    request('/grocery', {
      method: 'POST',
      body: itemData
    }),

  updateGroceryItem: (id, itemData) =>
    request(`/grocery/${id}`, {
      method: 'PUT',
      body: itemData
    }),

  toggleGroceryStatus: (id, isPurchased) =>
    request(`/grocery/${id}/status`, {
      method: 'PATCH',
      body: isPurchased !== undefined ? { isPurchased } : {}
    }),

  deleteGroceryItem: (id) =>
    request(`/grocery/${id}`, {
      method: 'DELETE'
    }),

  clearPurchased: () =>
    request('/grocery/purchased/clear', {
      method: 'DELETE'
    })
};

// Dashboard Service
export const dashboardAPI = {
  getStats: () =>
    request('/dashboard/stats')
};

// System Health Service
export const healthAPI = {
  checkHealth: () =>
    request('/health')
};

export default {
  auth: authAPI,
  recipes: recipeAPI,
  mealPlans: mealPlanAPI,
  grocery: groceryAPI,
  dashboard: dashboardAPI,
  health: healthAPI
};
