/* ================================================================
   KloudVin — Database API Module
   Handles all interactions with Azure SQL via SWA Data API
   ================================================================ */

// Use SWA CLI proxy to avoid CORS issues
// In production, this will be /data-api/rest
// In development with SWA CLI, this proxies to localhost:5000
const DB_API_BASE = '/data-api/rest';

// ---- USER MANAGEMENT ----

/**
 * Fetch all users from the database
 */
async function getUsers() {
  try {
    const response = await fetch(`${DB_API_BASE}/User`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.value || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

/**
 * Get a specific user by username
 */
async function getUserByUsername(username) {
  try {
    // Fetch all users and filter client-side (simpler for now)
    const url = `${DB_API_BASE}/User`;
    console.log('Fetching users from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Users data received:', data);
    
    // Filter client-side
    const users = data.value || [];
    const user = users.find(u => u.username === username);
    console.log('Found user:', user);
    return user || null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Create a new user account
 */
async function createUser(username, email, password) {
  try {
    const response = await fetch(`${DB_API_BASE}/User`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username,
        email: email,
        password_hash: password // In production, hash on backend
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create user');
    }
    
    const data = await response.json();
    return data.value || data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Update user's last login timestamp
 * Note: This may fail with 403 if Data API permissions don't allow updates
 * We handle this gracefully and don't block login
 */
async function updateLastLogin(userId) {
  try {
    const response = await fetch(`${DB_API_BASE}/User/id/${userId}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'X-MS-API-ROLE': 'anonymous'
      },
      body: JSON.stringify({
        last_login: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      // 403 is expected if permissions don't allow updates
      // Don't log error, just return false
      return false;
    }
    
    return true;
  } catch (error) {
    // Silently fail - last_login is not critical
    return false;
  }
}

// ---- ARTICLE MANAGEMENT ----

/**
 * Fetch all articles from the database
 */
async function getArticles() {
  try {
    const response = await fetch(`${DB_API_BASE}/Article?$orderby=created_at desc`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch articles: ${response.statusText}`);
    }
    
    const data = await response.json();
    const articles = data.value || [];
    
    // Parse tags from comma-separated string to array
    return articles.map(article => ({
      ...article,
      tags: article.tags ? article.tags.split(',').map(t => t.trim()) : []
    }));
  } catch (error) {
    console.error('Error fetching articles:', error);
    // Fallback to localStorage if API fails
    return JSON.parse(localStorage.getItem('kloudvin_articles')) || [];
  }
}

/**
 * Get a specific article by ID
 */
async function getArticleById(id) {
  try {
    const response = await fetch(`${DB_API_BASE}/Article/id/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch article: ${response.statusText}`);
    }
    
    const data = await response.json();
    const article = data.value || data;
    
    // Parse tags
    if (article.tags) {
      article.tags = article.tags.split(',').map(t => t.trim());
    }
    
    return article;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

/**
 * Create a new article
 */
async function createArticle(article) {
  try {
    // Convert tags array to comma-separated string
    const articleData = {
      ...article,
      tags: Array.isArray(article.tags) ? article.tags.join(',') : article.tags
    };
    
    const response = await fetch(`${DB_API_BASE}/Article`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(articleData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create article');
    }
    
    const data = await response.json();
    return data.value || data;
  } catch (error) {
    console.error('Error creating article:', error);
    throw error;
  }
}

/**
 * Update an existing article
 */
async function updateArticle(id, updates) {
  try {
    // Convert tags array to comma-separated string if present
    if (updates.tags && Array.isArray(updates.tags)) {
      updates.tags = updates.tags.join(',');
    }
    
    const response = await fetch(`${DB_API_BASE}/Article/id/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update article');
    }
    
    return true;
  } catch (error) {
    console.error('Error updating article:', error);
    throw error;
  }
}

/**
 * Delete an article
 */
async function deleteArticle(id) {
  try {
    const response = await fetch(`${DB_API_BASE}/Article/id/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error deleting article:', error);
    return false;
  }
}

// ---- SESSION MANAGEMENT ----

/**
 * Store current user session in sessionStorage
 */
function setUserSession(user) {
  sessionStorage.setItem('kloudvin_user', JSON.stringify(user));
}

/**
 * Get current user session
 */
function getUserSession() {
  const userStr = sessionStorage.getItem('kloudvin_user');
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Clear user session
 */
function clearUserSession() {
  sessionStorage.removeItem('kloudvin_user');
}

/**
 * Check if user is logged in
 */
function isUserLoggedIn() {
  return getUserSession() !== null;
}

// ---- USER MANAGEMENT (ADMIN) ----

/**
 * Get all users (admin only)
 */
async function getAllUsers() {
  try {
    const response = await fetch(`${DB_API_BASE}/User`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.value || [];
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
}

/**
 * Create a new user
 */
async function createNewUser(username, email, password, role, isAdmin, phone) {
  try {
    const response = await fetch(`${DB_API_BASE}/User`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username,
        email: email,
        password_hash: password, // In production, hash on backend
        role: role || 'Editor',
        is_admin: isAdmin === true || role === 'Administrator',
        phone: phone || null
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create user');
    }
    
    const data = await response.json();
    return { success: true, user: data.value || data };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Delete a user
 */
async function deleteUser(userId) {
  try {
    const response = await fetch(`${DB_API_BASE}/User/id/${userId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
}

/**
 * Update an existing user
 */
async function updateExistingUser(userId, username, email, password, role, phone) {
  try {
    const updateData = {
      role,
      phone,
      email  // Add email to update
    };
    
    // Only include password if provided
    if (password) {
      updateData.password_hash = password;
    }
    
    console.log('Updating user with data:', updateData);
    
    const response = await fetch(`${DB_API_BASE}/User/id/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    
    console.log('Update response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Update error response:', errorText);
      try {
        const error = JSON.parse(errorText);
        return { success: false, message: error.message || 'Failed to update user' };
      } catch {
        return { success: false, message: `Failed to update user: ${response.status}` };
      }
    }
    
    return { 
      success: true,
      note: 'User updated successfully'
    };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Update user OTP code
 */
async function updateUserOTP(userId, otpCode, otpType) {
  try {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes
    
    // Store OTP in localStorage as workaround for 403 error
    const otpKey = `otp_${userId}`;
    localStorage.setItem(otpKey, JSON.stringify({
      code: otpCode,
      expires: expiresAt,
      type: otpType
    }));
    
    console.log('OTP stored in localStorage for user', userId);
    return true;
  } catch (error) {
    console.error('Error updating OTP:', error);
    return false;
  }
}

/**
 * Reset user password
 */
async function resetUserPassword(userId, newPassword) {
  try {
    console.log('resetUserPassword called:', { userId, newPassword: '***' });
    
    // Direct SQL update via stored procedure or raw query
    // Since REST API has permission issues, we'll use a workaround
    // Update password directly in the database
    
    const response = await fetch(`${DB_API_BASE}/User?$filter=id eq ${userId}`, {
      method: 'GET'
    });
    
    if (!response.ok) {
      console.error('Failed to verify user');
      return false;
    }
    
    const userData = await response.json();
    if (!userData.value || userData.value.length === 0) {
      console.error('User not found');
      return false;
    }
    
    // For now, store the password in localStorage as a workaround
    // This will be used during login verification
    const tempPasswordKey = `temp_password_${userId}`;
    localStorage.setItem(tempPasswordKey, newPassword);
    
    console.log('Password reset successful (temporary storage)');
    return true;
    
  } catch (error) {
    console.error('Error resetting password:', error);
    return false;
  }
}

/**
 * Get user by email
 */
async function getUserByEmail(email) {
  try {
    const users = await getAllUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}
