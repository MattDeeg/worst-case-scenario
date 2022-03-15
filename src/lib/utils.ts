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
	ref.onValue((val) => store.set(val ?? defaultValue));
	return store;
};
