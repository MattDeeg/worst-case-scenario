import type { RequestHandler } from '@sveltejs/kit';
import type { RunningGame } from '$lib/firebase/docTypes/Game';
import { generateHand } from '$lib/api/generateHand';
import { nextVictim } from '$lib/api/nextVictim';
import { getBonusType } from '$lib/api/scoreRound';
import { getAll } from '$lib/api/refs';
import { store } from '$lib/firebase/server';

interface Payload {
	gameID: string;
}

export const post: RequestHandler = async (event) => {
	const payload: Payload = await event.request.json();
	const { gameID } = payload;

	if (!gameID) {
		return { body: { success: false } };
	}

	const { gameRef, metaRef, victimRef } = getAll(gameID);
	const meta = (await metaRef.get()).data();

	const victim = nextVictim(meta.users);
	if (!victim || !meta.users[victim]) {
		return { body: { success: false } };
	}

	const game = (await gameRef.get()).data() as RunningGame;
	const hand = await generateHand(
		meta.allowedPacks,
		game.cards.map((c) => c.id)
	);

	const unlockUsers = Object.keys(game.users).flatMap((userID) => [
		`users.${userID}.lockedIn`,
		false
	]);

	const bonusType = getBonusType(game.type);

	const success = await Promise.all([
		victimRef.set(
			{
				victim,
				cards: hand,
				readyToReveal: false,
				revealed: [false, false, false, false, false]
			},
			{ merge: true }
		),
		metaRef.update(
			'victim',
			victim,
			'bonusType',
			bonusType,
			`users${victim}.lastVictimAt`,
			Date.now(),
			'decisions',
			{}
		),
		gameRef.update(
			'bonusType',
			bonusType,
			'round',
			game.round + 1,
			'cards',
			[],
			'victim',
			victim,
			'decision',
			store.fieldValues.delete(),
			...unlockUsers
		)
	]).then(
		() => true,
		() => false
	);

	return { body: { success } };
};
