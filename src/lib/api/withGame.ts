import type { Game } from '$lib/firebase/docTypes/Game';
import type admin from 'firebase-admin';
import { store } from '$lib/firebase/server';

interface Result<T> {
	ref: admin.firestore.DocumentReference<T>;
	doc: admin.firestore.DocumentSnapshot<T>;
	game: T;
}

function validateGame<T extends Game = Game>(
	ref: admin.firestore.DocumentReference<Game>,
	doc: admin.firestore.DocumentSnapshot<Game>,
	exists: boolean,
	ensure?: (g: Game) => g is T
): Result<T> {
	if (doc.exists !== exists) {
		throw new Error('Game has unexpected existence');
	}

	const game = doc.data();
	if (typeof ensure === 'function') {
		if (ensure(game)) {
			return { ref, doc, game } as Result<T>;
		} else {
			throw new Error('Game does not match expected type');
		}
	}

	return { ref, doc, game } as Result<T>;
}

export async function getGame<T extends Game = Game>(
	gameID: string,
	exists: boolean,
	ensure?: (g: Game) => g is T
): Promise<Result<T>> {
	const ref = store.doc<Game>(`games/${gameID}`);
	const doc = await ref.get();
	return validateGame(ref, doc, exists, ensure);
}

export async function withGame<T extends Game>(
	gameID: string,
	exists: boolean,
	ensure: (g: Game) => g is T,
	updateFn: (transaction: admin.firestore.Transaction, r: Result<T>) => Promise<boolean>
): Promise<boolean> {
	return store.runTransaction(async (transaction) => {
		const ref = store.doc<Game>(`games/${gameID}`);
		const doc = await transaction.get(ref);
		const result = validateGame(ref, doc, exists, ensure);

		return updateFn(transaction, result).catch((ex) => {
			console.error(ex);
			return false;
		});
	}) as Promise<boolean>;
}
