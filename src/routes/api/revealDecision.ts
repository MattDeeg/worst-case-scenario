import type { RequestHandler } from '@sveltejs/kit';
import { scoreRound } from '$lib/api/scoreRound';
import { getAll } from '$lib/api/refs';
import type { Decision, RunningGame, Value } from '$lib/firebase/docTypes/Game';

interface Payload {
	gameID: string;
	index: number;
}

export const post: RequestHandler = async (event) => {
	const payload: Payload = await event.request.json();
	const { userID } = event.locals;
	const { gameID, index } = payload;

	if (!gameID || index == null) {
		return { body: { success: false } };
	}

	const { metaRef, victimRef, gameRef } = getAll<RunningGame>(gameID);
	const meta = (await metaRef.get()).data();

	if (meta.victim !== userID) {
		return { body: { success: false } };
	}

	const game = (await gameRef.get()).data();

	const tokenByUserId = Object.fromEntries(
		Object.entries(meta.decisions)
			.map(([userID, decisions]) => [userID, decisions?.tokens?.[index]])
			.filter(([, token]) => token != null && token > -1)
	) as Record<string, number>;

	const { [userID]: victimToken, ...otherTokens } = tokenByUserId;

	const decision: Decision = {
		card: game.cards[index],
		guessers: Object.entries(otherTokens).map(([userID, token]) => ({
			value: token as Value,
			color: meta.users[userID].color
		})),
		victimToken: { value: victimToken as Value, color: meta.users[userID].color }
	};

	const victim = (await victimRef.get()).data();
	const revealed = victim.revealed;
	revealed[index] = true;

	const users = game.users;
	if (revealed.every(Boolean)) {
		const points = scoreRound(meta);
		for (const userID in points) {
			users[userID].score += points[userID];
		}
	}

	const success = await Promise.all([
		victimRef.set(
			{
				revealed
			},
			{ merge: true }
		),
		gameRef.set(
			{
				decision,
				users
			},
			{ merge: true }
		)
	]).then(
		() => true,
		() => false
	);

	return { body: { success } };
};
