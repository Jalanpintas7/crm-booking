import { writable } from 'svelte/store';
import { getColors } from '../supabase.js';

// Create a writable store for colors/statuses
export const colors = writable([]);
export const colorsLoading = writable(false);
export const colorsError = writable(null);

// Function to load colors from database
export async function loadColors() {
  try {
    colorsLoading.set(true);
    colorsError.set(null);
    
    const colorsData = await getColors();
    colors.set(colorsData);
  } catch (error) {
    console.error('Error loading colors:', error);
    colorsError.set(error.message);
  } finally {
    colorsLoading.set(false);
  }
}

// Function to refresh colors
export function refreshColors() {
  loadColors();
}

// Initialize colors on store creation
loadColors();
