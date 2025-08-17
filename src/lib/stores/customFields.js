import { writable } from 'svelte/store';
import { browser } from '$app/environment';

function loadFromLocalStorage(key, fallback) {
	if (!browser) return fallback;
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return fallback;
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : fallback;
	} catch (e) {
		console.error('Error reading custom fields from localStorage:', e);
		return fallback;
	}
}

function createPersistentStore(key, initialValue) {
	const initial = loadFromLocalStorage(key, initialValue);
	const { subscribe, set, update } = writable(initial);

	// Persist on every change
	subscribe((value) => {
		if (!browser) return;
		try {
			localStorage.setItem(key, JSON.stringify(value));
		} catch (e) {
			console.error('Error saving custom fields to localStorage:', e);
		}
	});

	return { subscribe, set, update };
}

// Store untuk definisi medan tambahan di Contact Manager
// Struktur item: { id: string, name: string, type: 'text'|'number'|'boolean'|'email'|'phone'|'date'|'url', required: boolean }
export const contactCustomFields = createPersistentStore('contactCustomFields', []);


