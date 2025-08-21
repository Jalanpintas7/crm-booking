import { browser } from '$app/environment';

export const prerender = true;
export const ssr = true;

export function load() {
  // Only run on client side
  if (!browser) {
    return {};
  }

  // Check authentication status from localStorage
  const savedAuth = localStorage.getItem('authState');
  let isAuthenticated = false;
  let user = null;
  
  if (savedAuth) {
    try {
      const authState = JSON.parse(savedAuth);
      isAuthenticated = authState.isAuthenticated;
      user = authState.user;
    } catch (e) {
      console.error('Error parsing auth state:', e);
      isAuthenticated = false;
      user = null;
    }
  }

  return {
    isAuthenticated,
    user
  };
} 