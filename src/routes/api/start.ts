import type { RequestHandler } from '@sveltejs/kit';
import { isLobbyGame, type RunningGame } from '$lib/firebase/docTypes/Game';
import { generateHand } from '$lib/api/generateHand';
import { nextVictim } from '$lib/api/nextVictim';
import { getBonusType } from '$lib/api/scoreRound';
import { getAll } from '$lib/api/refs';

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
	const game = (await gameRef.get()).data();

	if (!isLobbyGame(game)) {
		return { body: { success: false } };
	}

	const users = Object.values(game.users);
	if (users.length < 3) {
		console.error('not enough users');
		return { body: { success: false } };
	}

	const allReady = users.every((user) => user.ready);
	if (!allReady) {
		console.error('not all ready');
		return { body: { success: false } };
	}

	const meta = (await metaRef.get()).data();
	const hand = await generateHand(meta.allowedPacks);

	const victim = nextVictim(meta.users);
	if (!victim || !game.users[victim]) {
		console.error('cant get victim');
		return { body: { success: false } };
	}

	const bonusType = getBonusType(game.type);
	const newGame: RunningGame = {
		...game,
		round: 1,
		cards: [],
		victim,
		bonusType,
		decision: null
	};

	const success = await Promise.all([
		metaRef.update(
			'victim',
			victim,
			`users.${victim}.lastVictimAt`,
			Date.now(),
			'bonusType',
			bonusType
		),
		victimRef.set(
			{
				victim,
				cards: hand
			},
			{ merge: true }
		),
		gameRef.set(newGame)
	]).then(
		() => true,
		() => false
	);

	return { body: { success } };
};
