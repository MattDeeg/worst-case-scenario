import type { RequestHandler } from '@sveltejs/kit';
import { getGame, getMeta } from '$lib/api/refs';

interface Payload {
	gameID: string;
	color: string;
	displayName: string;
	ready: boolean;
}

export const post: RequestHandler = async (event) => {
	const payload: Payload = await event.request.json();
	const userID = event.locals.userID;
	const { gameID, color, displayName, ready } = payload;

	if (!gameID || !color || !displayName) {
		return { body: { success: false } };
	}

	const gameRef = getGame(gameID);
	const game = (await gameRef.get()).data();
	const metaRef = getMeta(gameID);

	if (!game.users[userID]) {
		return { body: { success: false } };
	}

	const success = await Promise.all([
		gameRef.update(
			`users.${userID}.displayName`,
			displayName,
			`users.${userID}.color`,
			color,
			`users.${userID}.ready`,
			ready ?? true
		),
		metaRef.update(`users.${userID}.color`, color)
	]).then(
		() => true,
		() => false
	);

	return { body: { success } };
};
