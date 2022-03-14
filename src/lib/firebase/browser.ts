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
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { isLimit, isSortBy, isWhere, type QueryClause } from './types';

const getComponent = (app: FirebaseApp) => {
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

const configStr = import.meta.env.VITE_FIREBASE_CLIENT_CONFIG as string;
const config = JSON.parse(configStr);

const existing = getApps()[0];
const app = existing || initializeApp(config);

export const store = getComponent(app);
export * from './common';
