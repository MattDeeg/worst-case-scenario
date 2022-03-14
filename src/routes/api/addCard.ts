import type { RequestHandler } from '@sveltejs/kit';
import { store } from '$lib/firebase/server';
import type { Predicament } from '$lib/firebase/docTypes/Predicament';

interface Payload {
	text: string;
	pack: string;
}

export const post: RequestHandler = async (event) => {
	const payload: Payload = await event.request.json();
	const { text, pack } = payload;

	if (!text || !pack) {
		return { body: { success: false } };
	}

	const formatted = text.toUpperCase().trim();

	const success = (await store.runTransaction(async (transaction) => {
		const packsRef = store.doc('meta/packs');
		transaction.update(packsRef, {
			packs: store.fieldValues.arrayUnion(pack)
		});

		const duplicates = await store
			.collection('predicaments', [{ field: 'text', op: '==', value: formatted }])
			.get();
		if (!duplicates.empty) {
			return false;
		}

		const doc = store.collectionDoc<Predicament>('predicaments');
		transaction.set(doc, {
			id: doc.id,
			pack,
			text: formatted,
			seed: Math.random()
		});

		return true;
	})) as boolean;

	return { body: { success } };
};
