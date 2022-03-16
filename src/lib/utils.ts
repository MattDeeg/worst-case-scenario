import type { RefOf } from './firebase/dbTypes/Accessor';
import { writable, type Readable } from 'svelte/store';
import type { JSONValue } from '@sveltejs/kit/types/internal';
import type { JSONObject } from '@sveltejs/kit/types/internal';

export const asSuccess = (...promises: Promise<unknown>[]) =>
	Promise.all(promises).then(
		() => true,
		(ex) => {
			console.error(ex);
			return false;
		}
	);

export const refExists = <T>(ref: RefOf<T>) =>
	ref.get().then(
		(snap) => snap.exists(),
		() => false
	);

export interface SuccessResponse extends JSONObject {
	success: boolean;
	data: JSONValue;
}
export interface ErrorResponse extends JSONObject {
	success: boolean;
	error: string;
}
export type Response = SuccessResponse | ErrorResponse;
export const successResponse = (
	success: boolean,
	error?: string,
	data?: JSONValue
): { body: Response } => {
	if (success === true) {
		return { body: { success, data } };
	}
	return { body: { success, error } };
};

export const watchStore = <T>(ref: RefOf<T>, defaultValue?: T): Readable<T> => {
	const store = writable(defaultValue);
	ref.onValue((snap) => store.set(snap.exists() ? snap.val() : defaultValue));
	return store;
};

export function darkenHex(H) {
	// Convert hex to RGB first
	let r = 0;
	let g = 0;
	let b = 0;
	if (H.length == 4) {
		r = parseInt(H[1] + H[1], 16);
		g = parseInt(H[2] + H[2], 16);
		b = parseInt(H[3] + H[3], 16);
	} else if (H.length == 7) {
		r = parseInt(H[1] + H[2], 16);
		g = parseInt(H[3] + H[4], 16);
		b = parseInt(H[5] + H[6], 16);
	}
	// Then to HSL
	r /= 255;
	g /= 255;
	b /= 255;
	const cmin = Math.min(r, g, b);
	const cmax = Math.max(r, g, b);
	const delta = cmax - cmin;
	let h = 0;
	let s = 0;
	let l = 0;

	if (delta == 0) h = 0;
	else if (cmax == r) h = ((g - b) / delta) % 6;
	else if (cmax == g) h = (b - r) / delta + 2;
	else h = (r - g) / delta + 4;

	h = Math.round(h * 60);

	if (h < 0) h += 360;

	l = (cmax + cmin) / 2;
	s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
	s = +(s * 100).toFixed(1);
	l = +(l * 100).toFixed(1);

	return `hsl(${h},${s}%,${Math.max(0, l - 20)}%)`;
}
