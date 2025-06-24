// Development authentication helper
// Ensures consistent authentication state across tabs

export function ensureDevAuthentication() {
  // For development, ensure we have a consistent auth state
  if (!localStorage.getItem('tulboxx_auth_token')) {
    // Set a default development token
    localStorage.setItem('tulboxx_auth_token', 'dev-token-12345');
  }

  if (!localStorage.getItem('tulboxx_user')) {
    // Set default development user
    const devUser = {
      id: 1,
      email: 'admin@tulboxx.com',
      role: 'admin',
      businessProfileId: 1,
      isActive: true
    };
    localStorage.setItem('tulboxx_user', JSON.stringify(devUser));
  }
}

// Auto-initialize disabled for testing login screen
// if (typeof window !== 'undefined') {
//   ensureDevAuthentication();
// }