import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Function to get saved auth state from localStorage
function getSavedAuthState() {
  if (browser) {
    try {
      const saved = localStorage.getItem('authState');
      return saved ? JSON.parse(saved) : { isAuthenticated: false, user: null };
    } catch (e) {
      console.error('Error reading auth state from localStorage:', e);
      return { isAuthenticated: false, user: null };
    }
  }
  return { isAuthenticated: false, user: null };
}

// Function to save auth state to localStorage
function saveAuthState(state) {
  if (browser) {
    try {
      localStorage.setItem('authState', JSON.stringify(state));
    } catch (e) {
      console.error('Error saving auth state to localStorage:', e);
    }
  }
}

// Create auth store
export const authStore = writable(getSavedAuthState());

// Subscribe to changes and save to localStorage
authStore.subscribe((state) => {
  saveAuthState(state);
});

// Auth functions
export async function login(username, password) {
  try {
    // Import supabase client
    const { supabase } = await import('../supabase.js');
    
    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password: password
    });
    
    if (error) {
      console.error('Supabase auth error:', error);
      
      // Handle specific error cases
      if (error.message.includes('Invalid login credentials')) {
        return { 
          success: false, 
          message: 'Email atau kata laluan salah!' 
        };
      } else if (error.message.includes('Email not confirmed')) {
        return { 
          success: false, 
          message: 'Email belum disahkan. Sila periksa email anda.' 
        };
      } else {
        return { 
          success: false, 
          message: 'Ralat autentikasi: ' + error.message 
        };
      }
    }
    
    // Login successful
    const user = { 
      username: data.user.email, 
      role: data.user.user_metadata?.role || 'user',
      id: data.user.id
    };
    
    const authState = { isAuthenticated: true, user };
    authStore.set(authState);
    
    return { success: true, message: 'Login berjaya!' };
    
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      message: 'Ralat semasa log masuk. Sila cuba lagi.' 
    };
  }
}

export async function logout() {
  try {
    // Import supabase client
    const { supabase } = await import('../supabase.js');
    
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Supabase logout error:', error);
    }
    
    // Clear local auth state
    const authState = { isAuthenticated: false, user: null };
    authStore.set(authState);
    
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear local state even if Supabase logout fails
    const authState = { isAuthenticated: false, user: null };
    authStore.set(authState);
  }
}

export async function checkAuth() {
  try {
    // Import supabase client
    const { supabase } = await import('../supabase.js');
    
    // Get current session from Supabase
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Supabase session check error:', error);
      return false;
    }
    
    if (session) {
      // User is authenticated, update local store
      const user = { 
        username: session.user.email, 
        role: session.user.user_metadata?.role || 'user',
        id: session.user.id
      };
      
      authStore.set({ isAuthenticated: true, user });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
}
