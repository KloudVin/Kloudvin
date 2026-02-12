/* ================================================================
   KloudVin — Database API Module
   Handles all interactions with Azure SQL via SWA Data API
   ================================================================ */

const DB_API_BASE = '/.data-api/rest';

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
    const response = await fetch(`${DB_API_BASE}/User?$filter=username eq '${username}'`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.value && data.value.length > 0 ? data.value[0] : null;
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
 */
async function updateLastLogin(userId) {
  try {
    const response = await fetch(`${DB_API_BASE}/User/id/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        last_login: new Date().toISOString()
      })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error updating last login:', error);
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
