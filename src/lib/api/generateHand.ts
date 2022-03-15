import type { Predicament } from '$lib/firebase/docTypes/Predicament';
import { store } from '$lib/firebase/server';

export interface Card {
	id: string;
	text: string;
}

export const getCard = async (
	allowedPacks: string[],
	omitIDs: string[] = []
): Promise<Predicament> => {
	const seed = Math.random();
	const predicaments = await store
		.collection<Predicament>('predicaments', [
			allowedPacks.length > 0 ? { field: 'pack', op: 'in', value: allowedPacks } : null,
			{ field: 'seed', op: '>=', value: seed },
			{ limit: 1 }
		])
		.get();
	if (predicaments.empty) {
		// should only happen when the rolled seed is higher than everything in the collection
		return getCard(allowedPacks, omitIDs);
	}
	const predicament = predicaments.docs[0];
	if (omitIDs.includes(predicament.id)) {
		return getCard(allowedPacks, omitIDs);
	}
	return predicament.data();
};

export const generateHand = async (allowedPacks: string[], omitIDs?: string[]): Promise<Card[]> => {
	const exclude = omitIDs ?? [];
	const newCards = [];
	for (let i = 0; i < 5; i++) {
		const card = await getCard(allowedPacks, exclude);
		exclude.push(card.id);
		newCards.push(card);
	}

	return newCards.map((p: Predicament) => ({ id: p.id, text: p.text }));
};
