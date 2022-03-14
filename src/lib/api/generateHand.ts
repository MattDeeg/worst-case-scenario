import type { Predicament } from '$lib/firebase/docTypes/Predicament';
import { store } from '$lib/firebase/server';

const getCard = async (allowedPacks: string[], omitIDs: string[] = []): Promise<Predicament> => {
	const seed = Math.random();
	const predicaments = await store
		.collection<Predicament>('predicaments', [
			{ field: 'pack', op: 'in', value: allowedPacks },
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

export const generateHand = async (
	allowedPacks: string[],
	omitIDs?: string[]
): Promise<Predicament[]> => {
	const exclude = omitIDs ?? [];
	const newCards = [];
	for (let i = 0; i < 5; i++) {
		const card = await getCard(allowedPacks, exclude);
		exclude.push(card.id);
		newCards.push(card);
	}

	return newCards;
};
