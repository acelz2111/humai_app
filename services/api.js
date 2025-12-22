// services/api.js
const API_URL = 'http://192.168.101.8/humai_web/public/api';

// Login user
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Register new user
export const register = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

// Get all users
export const getUsers = async () => {
  try {
    const response = await fetch(`${API_URL}/users`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get users error:', error);
    throw error;
  }
};

// Get single user
export const getUser = async (id) => {
  try {
    const response = await fetch(`${API_URL}/user/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
};

// Update user
export const updateUser = async (id, userData) => {
  try {
    const response = await fetch(`${API_URL}/user/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Update user error:', error);
    throw error;
  }
};

// Delete user
export const deleteUser = async (id) => {
  try {
    const response = await fetch(`${API_URL}/user/${id}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Delete user error:', error);
    throw error;
  }
};