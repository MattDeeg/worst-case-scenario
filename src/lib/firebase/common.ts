import type { DocumentReference, Transaction } from 'firebase/firestore';
import type admin from 'firebase-admin';

export const validateDocumentID = (maybeID: string) =>
	/^(?!\.\.?$)(?!.*__.*__)([^/]{1,1500})$/.test(maybeID);

const flatten = (obj: unknown, idempotent: string[], prefix: string[]): unknown[] => {
	if (typeof obj !== 'object') {
		return [];
	}
	if (idempotent.includes(prefix.join('.'))) {
		return [prefix.join('.'), obj];
	}

	return Object.entries(obj).flatMap(([k, v]) => {
		const key = [...prefix, k];
		if (typeof v === 'object') {
			return flatten(v, idempotent, key);
		}
		return [key.join('.'), v];
	});
};

export const flattenFields = (obj: unknown, idempotent: string[] = []): unknown[] => {
	return flatten(obj, idempotent, []);
};

export function update<T>(
	transaction: Transaction,
	ref: DocumentReference<T>,
	obj: DeepPartial<T>,
	idempotent?: string[]
): Transaction;
export function update<T>(
	transaction: admin.firestore.Transaction,
	ref: admin.firestore.DocumentReference<T>,
	obj: DeepPartial<T>,
	idempotent?: string[]
): admin.firestore.Transaction;
export function update<T>(
	transaction: Transaction | admin.firestore.Transaction,
	ref: DocumentReference<T> | admin.firestore.DocumentReference<T>,
	obj: DeepPartial<T>,
	idempotent: string[] = []
): Transaction | admin.firestore.Transaction {
	const [firstKey, firstValue, ...updates] = flattenFields(obj, idempotent);
	return (transaction as Transaction).update(
		ref as DocumentReference<T>,
		firstKey as string,
		firstValue,
		...updates
	);
}
