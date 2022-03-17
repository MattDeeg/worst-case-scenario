import type { DataSnapshot } from '../types';
import type { DBSchema } from './Database';

const flatten = (obj: unknown, path = '') => {
	if (typeof obj !== 'object' || Array.isArray(obj) || obj == null) {
		return obj;
	}
	const flattened = Object.entries(obj).flatMap(([key, value]) => {
		const nKey = path === '' ? key : `${path}/${key}`;
		if (typeof value === 'object' && !Array.isArray(value) && value != null) {
			return flatten(value, nKey);
		}
		return [[nKey, value]];
	});

	return flattened;
};
const flattenPartialObject = (obj: unknown) => {
	return Object.fromEntries(flatten(obj));
};

export interface Ref<T> {
	get: () => Promise<DataSnapshot<T>>;
	set: (data: T) => Promise<void>;
	update: (data: DeepPartial<T>) => Promise<void>;
	transaction: (callback: (current: T) => T) => Promise<void>;
	onValue: (callback: (current: DataSnapshot<T>) => unknown) => void;
}

export type RefOf<T> = {
	[K in keyof T]: RefOf<T[K]>;
} & Ref<T>;

const ref = <T>(db: Database, path: string): Ref<T> => ({
	get: () => db.get(path) as Promise<DataSnapshot<T>>,
	set: (value: T) => db.set(path, value),
	update: (value: DeepPartial<T>) => {
		const flatValue = flattenPartialObject(value);
		return db.update(path, flatValue);
	},
	transaction: (callback: (current: T) => T) => db.transaction(path, callback),
	onValue: (callback: (current: DataSnapshot<T>) => unknown) => db.onValue(path, callback)
});

const asRef = <T>(db: Database, path: string): RefOf<T> => {
	return new Proxy(ref(db, path), {
		get: (object, key) => {
			if (key in object) {
				return object[key];
			}
			return asRef(db, `${path}/${key as string}`);
		}
	}) as unknown as RefOf<T>;
};

export interface Database {
	get: (path: string) => Promise<DataSnapshot>;
	set: (path: string, data: unknown) => Promise<void>;
	update: (path: string, data: unknown) => Promise<void>;
	transaction: (path: string, callback: (current: unknown) => unknown) => Promise<void>;
	onValue: (path: string, callback: (value: unknown) => void) => void;
}

export const wrapDatabase = (db: Database) => {
	return asRef<DBSchema>(db, '');
};
