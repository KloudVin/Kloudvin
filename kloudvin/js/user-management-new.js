// ================================================================
// USER MANAGEMENT (Administrator Only) - NEW VERSION
// ================================================================

// Show users list view
function showUsersList() {
  document.getElementById('adminUsersView').style.display = 'block';
  document.getElementById('adminUserFormView').style.display = 'none';
  document.getElementById('adminLoginView').style.display = 'none';
  document.getElementById('adminResetView').style.display = 'none';
  renderUsersList();
}

// Show user form view (create or edit)
function showUserForm(mode, user = null) {
  document.getElementById('adminUsersView').style.display = 'none';
  document.getElementById('adminUserFormView').style.display = 'block';
  document.getElementById('adminLoginView').style.display = 'none';
  document.getElementById('adminResetView').style.display = 'none';
  
  const title = document.getElementById('userFormTitle');
  const desc = document.getElementById('userFormDesc');
  const submitBtn = document.getElementById('userFormSubmitBtn');
  const editingUserId = document.getElementById('editingUserId');
  
  // Clear form
  clearUserForm();
  
  if (mode === 'edit' && user) {
    // Edit mode
    title.textContent = 'Edit User';
    desc.textContent = 'Update user details';
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Update User';
    editingUserId.value = user.id;
    
    // Populate form
    const usernameInput = document.getElementById('newUserUsername');
    const emailInput = document.getElementById('newUserEmail');
    
    usernameInput.value = user.username;
    emailInput.value = user.email;
    document.getElementById('newUserPhone').value = user.phone || '';
    document.getElementById('newUserRole').value = user.role || 'Editor';
    document.getElementById('newUserPassword').placeholder = 'Leave empty to keep current password';
    
    // Make username read-only (email can be edited)
    usernameInput.readOnly = true;
    usernameInput.style.opacity = '0.6';
    usernameInput.style.cursor = 'not-allowed';
  } else {
    // Create mode
    title.textContent = 'Add New User';
    desc.textContent = 'Create a new user account';
    submitBtn.innerHTML = '<i class="fas fa-plus"></i> Create User';
    editingUserId.value = '';
  }
}

// Clear user form
function clearUserForm() {
  const usernameInput = document.getElementById('newUserUsername');
  const emailInput = document.getElementById('newUserEmail');
  
  usernameInput.value = '';
  emailInput.value = '';
  document.getElementById('newUserPhone').value = '';
  document.getElementById('newUserRole').value = 'Editor';
  document.getElementById('newUserPassword').value = '';
  document.getElementById('newUserConfirmPassword').value = '';
  document.getElementById('newUserPassword').placeholder = 'Password (min 6 chars)';
  document.getElementById('editingUserId').value = '';
  
  // Re-enable username and email
  usernameInput.readOnly = false;
  emailInput.readOnly = false;
  usernameInput.style.opacity = '1';
  emailInput.style.opacity = '1';
  usernameInput.style.cursor = 'text';
  emailInput.style.cursor = 'text';
}

// Submit user form (create or update)
async function submitUserForm() {
  const editingUserId = document.getElementById('editingUserId').value;
  
  if (editingUserId) {
    await updateUser(parseInt(editingUserId));
  } else {
    await addNewUser();
  }
}

// Render users list
async function renderUsersList() {
  const list = document.getElementById('usersListContainer');
  if (!list) return;
  
  list.innerHTML = '<div style="text-align:center;padding:1rem;color:var(--text-muted)"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
  
  const users = await getAllUsers();
  const session = getUserSession();
  
  list.innerHTML = '';
  
  if (users.length === 0) {
    list.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text-muted)">No users found</div>';
    return;
  }
  
  users.forEach(u => {
    const isCurrentUser = session && session.userId === u.id;
    const item = document.createElement('div');
    item.className = 'manage-item';
    item.innerHTML = `
      <div class="manage-item-info">
        <div class="manage-item-title">
          ${u.username}${isCurrentUser ? ' <span style="color:var(--neon-emerald);font-size:.65rem">(you)</span>' : ''}
        </div>
        <div class="manage-item-meta">
          <span class="manage-item-cat" style="background:${u.role === 'Administrator' ? 'rgba(0,240,255,.08);color:#00f0ff' : 'rgba(139,92,246,.08);color:#8b5cf6'}">${u.role}</span>
          ${u.email ? ' · ' + u.email : ''}
          ${u.phone ? ' · ' + u.phone : ''}
        </div>
      </div>
      <div class="manage-item-actions">
        <button class="manage-btn manage-btn-edit" onclick="editUserById(${u.id})" title="Edit user"><i class="fas fa-edit"></i></button>
        ${isCurrentUser ? '' : `<button class="manage-btn manage-btn-del" onclick="deleteUserById(${u.id})" title="Delete user"><i class="fas fa-trash"></i></button>`}
      </div>`;
    list.appendChild(item);
  });
}

// Edit user by ID
async function editUserById(userId) {
  const users = await getAllUsers();
  const user = users.find(u => u.id === userId);
  if (user) {
    showUserForm('edit', user);
  }
}

// Delete user by ID
async function deleteUserById(userId) {
  if (!confirm('Delete this user permanently?')) return;
  
  const success = await deleteUser(userId);
  
  if (success) {
    showToast('User deleted successfully');
    renderUsersList();
  } else {
    showToast('Failed to delete user', true);
  }
}

// Update user
async function updateUser(userId) {
  const username = document.getElementById('newUserUsername').value.trim();
  const email = document.getElementById('newUserEmail').value.trim();
  const password = document.getElementById('newUserPassword').value;
  const confirmPassword = document.getElementById('newUserConfirmPassword').value;
  const phone = document.getElementById('newUserPhone').value.trim();
  const role = document.getElementById('newUserRole').value;
  
  // Validation
  if (!username) { showToast('Please enter a username', true); return; }
  if (username.length < 3) { showToast('Username must be at least 3 characters', true); return; }
  if (!email) { showToast('Please enter an email address', true); return; }
  if (!phone) { showToast('Please enter a phone number', true); return; }
  if (!role) { showToast('Please select a role', true); return; }
  
  // Phone validation
  const phoneRegex = /^\+\d{1,3}\s?\d{10}$/;
  if (!phoneRegex.test(phone)) {
    showToast('Invalid phone format. Use: +CountryCode PhoneNumber (e.g., +91 9876543210)', true);
    return;
  }
  
  // Password validation (only if provided)
  if (password || confirmPassword) {
    if (password !== confirmPassword) {
      showToast('Passwords do not match', true);
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', true);
      return;
    }
  }
  
  try {
    const result = await updateExistingUser(userId, username, email, password, role, phone);
    
    if (result.success) {
      showToast(`User updated successfully!`);
      showUsersList(); // Go back to list view
    } else {
      showToast(result.message || 'Failed to update user', true);
    }
  } catch (error) {
    console.error('Error in updateUser:', error);
    showToast('Failed to update user', true);
  }
}

// Add new user
async function addNewUser() {
  const username = document.getElementById('newUserUsername').value.trim();
  const email = document.getElementById('newUserEmail').value.trim();
  const password = document.getElementById('newUserPassword').value;
  const confirmPassword = document.getElementById('newUserConfirmPassword').value;
  const phone = document.getElementById('newUserPhone').value.trim();
  const role = document.getElementById('newUserRole').value;
  
  // Validation
  if (!username) { showToast('Please enter a username', true); return; }
  if (username.length < 3) { showToast('Username must be at least 3 characters', true); return; }
  if (!email) { showToast('Please enter an email address', true); return; }
  if (!password) { showToast('Please enter a password', true); return; }
  if (password.length < 6) { showToast('Password must be at least 6 characters', true); return; }
  if (!confirmPassword) { showToast('Please confirm your password', true); return; }
  if (password !== confirmPassword) { showToast('Passwords do not match', true); return; }
  if (!phone) { showToast('Please enter a phone number', true); return; }
  if (!role) { showToast('Please select a role', true); return; }
  
  // Phone validation
  const phoneRegex = /^\+\d{1,3}\s?\d{10}$/;
  if (!phoneRegex.test(phone)) {
    showToast('Invalid phone format. Use: +CountryCode PhoneNumber (e.g., +91 9876543210)', true);
    return;
  }
  
  const isAdmin = role === 'Administrator';
  const result = await createNewUser(username, email, password, role, isAdmin, phone);
  
  if (result.success) {
    showToast(`User "${username}" created successfully!`);
    showUsersList(); // Go back to list view
  } else {
    showToast(result.message || 'Failed to create user', true);
  }
}

// Update openUsersPanel to show list view
function openUsersPanel() {
  // Close CMS modal if open
  closeCMSModal();
  
  const overlay = document.getElementById('adminModalOverlay');
  if (!overlay) return;
  showUsersList(); // Show list view
  overlay.classList.add('open');
}
