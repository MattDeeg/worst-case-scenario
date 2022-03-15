import admin from 'firebase-admin';
import type { Reference } from '@firebase/database-types';
import { isLimit, isSortBy, isWhere, type DataSnapshot, type QueryClause } from './types';

const getStoreComponent = (app: admin.app.App) => {
	const store = app.firestore();

	function collection<T>(path: string): admin.firestore.CollectionReference<T>;
	function collection<T>(path: string, queries: QueryClause[]): admin.firestore.Query<T>;
	function collection<T>(path: string, queries?: QueryClause[]) {
		const collection = store.collection(path) as admin.firestore.CollectionReference<T>;
		if (queries == null) {
			return collection;
		}
		return queries.reduce((acc, query) => {
			if (isSortBy(query)) {
				return acc.orderBy(query.sortBy);
			} else if (isLimit(query)) {
				return acc.limit(query.limit);
			} else if (isWhere(query)) {
				return acc.where(query.field, query.op, query.value);
			}
			return acc;
		}, collection);
	}

	function setDoc<T>(
		doc: admin.firestore.DocumentReference<T>,
		data: T
	): Promise<admin.firestore.WriteResult>;
	function setDoc<T>(
		doc: admin.firestore.DocumentReference<T>,
		data: DeepPartial<T>,
		opts: admin.firestore.SetOptions
	): Promise<admin.firestore.WriteResult>;
	function setDoc<T>(
		doc: admin.firestore.DocumentReference<T>,
		data: DeepPartial<T>,
		opts?: admin.firestore.SetOptions
	): Promise<admin.firestore.WriteResult> {
		return doc.set(data as Partial<T>, opts);
	}

	return {
		generateID: () => {
			const col = store.collection('__autogenerate__');
			return col.doc().id;
		},
		collection,
		doc: <T>(pathOrCollection: string | admin.firestore.CollectionReference<T>) => {
			if (typeof pathOrCollection === 'string') {
				return store.doc(pathOrCollection) as admin.firestore.DocumentReference<T>;
			} else {
				return pathOrCollection.doc();
			}
		},
		collectionDoc: <T>(path: string) => {
			const collection = store.collection(path) as admin.firestore.CollectionReference<T>;
			return collection.doc();
		},
		getDoc: <T>(doc: admin.firestore.DocumentReference<T>) => doc.get(),
		getDocs: <T>(query: admin.firestore.Query<T>) => query.get(),
		setDoc,
		addDoc: <T>(collection: admin.firestore.CollectionReference<T>, data: T) =>
			collection.add(data),
		deleteDoc: (doc: admin.firestore.DocumentReference) => doc.delete(),
		writeBatch: () => store.batch(),
		runTransaction: (updateFn: (transaction: admin.firestore.Transaction) => Promise<unknown>) =>
			store.runTransaction(updateFn),
		fieldValues: {
			arrayUnion: admin.firestore.FieldValue.arrayUnion,
			arrayRemove: admin.firestore.FieldValue.arrayRemove,
			delete: admin.firestore.FieldValue.delete,
			increment: admin.firestore.FieldValue.increment,
			serverTimestamp: admin.firestore.FieldValue.serverTimestamp
		}
	};
};

const getDatabaseComponent = (app: admin.app.App) => {
	const database = app.database();

	type Callback = (snapshot: DataSnapshot) => unknown;

	const ensureRef = (path: string): Reference => database.ref(path);

	return {
		get: (path: string): Promise<DataSnapshot> => ensureRef(path).get(),
		set: (path: string, data: unknown): Promise<void> => ensureRef(path).set(data),
		update: (path: string, data: unknown): Promise<void> => ensureRef(path).update(data),
		onValue: (path: string, callback: Callback) => ensureRef(path).on('value', callback),
		transaction: <T>(path: string, callback: (current: T) => T): Promise<void> =>
			ensureRef(path).transaction(callback)
	};
};

const configStr = import.meta.env.VITE_FIREBASE_SERVER_CONFIG as string;
const config = JSON.parse(configStr);
config.credential = admin.credential.cert(config.credential);

const app = admin.apps[0] || admin.initializeApp(config);

export const store = getStoreComponent(app);
export const database = getDatabaseComponent(app);
export * from './common';
