import {
	collection,
	doc,
	getFirestore,
	getDoc,
	getDocs,
	getDocsFromCache,
	onSnapshot,
	setDoc,
	addDoc,
	deleteDoc,
	query,
	orderBy,
	runTransaction,
	limit,
	where,
	writeBatch,
	arrayRemove,
	arrayUnion,
	deleteField,
	increment,
	serverTimestamp,
	CollectionReference,
	Transaction,
	DocumentReference
} from 'firebase/firestore';
import {
	getDatabase,
	ref,
	set,
	update,
	onValue,
	get,
	runTransaction as dbTransaction,
	type DatabaseReference
} from 'firebase/database';
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { isLimit, isSortBy, isWhere, type DataSnapshot, type QueryClause } from './types';

const getStoreComponent = (app: FirebaseApp) => {
	const store = getFirestore(app);

	return {
		generateID: () => {
			const col = collection(store, '__autogenerate__');
			return doc(col).id;
		},
		collection: <T>(path: string, queries: QueryClause[] = []) => {
			const conditions = queries
				.map((query) => {
					if (isSortBy(query)) {
						return orderBy(query.sortBy);
					} else if (isLimit(query)) {
						return limit(query.limit);
					} else if (isWhere(query)) {
						return where(query.field, query.op, query.value);
					}
				})
				.filter(Boolean);
			const collectionRef = collection(store, path) as CollectionReference<T>;
			return conditions.length === 0 ? collectionRef : query<T>(collectionRef, ...conditions);
		},
		doc: <T>(pathOrCollection: string | CollectionReference<T>) => {
			if (typeof pathOrCollection === 'string') {
				return doc(store, pathOrCollection) as DocumentReference<T>;
			} else {
				return doc(pathOrCollection) as DocumentReference<T>;
			}
		},
		collectionDoc: <T>(path: string) => {
			const collectionRef = collection(store, path) as CollectionReference<T>;
			return doc(collectionRef);
		},
		getDoc,
		getDocs: <T>(query: CollectionReference<T>, fromCache?: boolean) => {
			if (fromCache) {
				return getDocsFromCache(query);
			}
			return getDocs(query);
		},
		onSnapshot,
		setDoc,
		addDoc,
		deleteDoc,
		writeBatch: () => writeBatch(store),
		runTransaction: (updateFn: (transaction: Transaction) => Promise<unknown>) =>
			runTransaction(store, updateFn),
		fieldValues: {
			arrayUnion,
			arrayRemove,
			delete: deleteField,
			increment,
			serverTimestamp
		}
	};
};

const getDatabaseComponent = (app: FirebaseApp) => {
	const database = getDatabase(app);

	type Callback = (snapshot: DataSnapshot) => unknown;

	const ensureRef = (path: string): DatabaseReference => ref(database, path);

	return {
		get: (path: string): Promise<DataSnapshot> => get(ensureRef(path)),
		set: (path: string, data: unknown): Promise<void> => set(ensureRef(path), data),
		update: (path: string, values: object) => update(ensureRef(path), values),
		onValue: (path: string, callback: Callback) => onValue(ensureRef(path), callback),
		transaction: <T>(path: string, callback: (current: T) => T): Promise<void> =>
			dbTransaction(ensureRef(path), callback).then(() => null)
	};
};

const configStr = import.meta.env.VITE_FIREBASE_CLIENT_CONFIG as string;
const config = JSON.parse(configStr);

const existing = getApps()[0];
const app = existing || initializeApp(config);

export const store = getStoreComponent(app);
export const database = getDatabaseComponent(app);

export * from './common';
