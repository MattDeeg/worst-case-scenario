import type { RequestHandler } from '@sveltejs/kit';
import type { User } from '$lib/firebase/docTypes/Game';
import { getString } from '$lib/api/readFormData';
import { nextColor } from '$lib/api/nextColor';
import { getGame } from '$lib/api/refs';

export const post: RequestHandler = async (event) => {
	const formData = await event.request.formData();

	const userID = event.locals.userID;
	const gameID = getString(formData, 'gameID');
	const displayName = getString(formData, 'displayName');

	if (!gameID || !userID || !displayName) {
		return {
			status: 302,
			headers: {
				location: '/?error=data'
			}
		};
	}

	const gameRef = getGame(gameID);
	const game = (await gameRef.get()).data();

	if (game.users[userID]) {
		// already joined
		return {
			status: 302,
			headers: {
				location: `/room/${gameID}`
			}
		};
	}
	const newUser: User = {
		id: userID,
		host: false,
		displayName,
		color: nextColor(game),
		score: 0,
		ready: false
	};

	const success = await Promise.all([gameRef.update(`users.${userID}`, newUser)]).then(
		() => true,
		() => false
	);

	if (!success) {
		return {
			status: 302,
			headers: {
				location: `/?error=nogame`
			}
		};
	}

	// TODO redirect based on error handling
	return {
		status: 302,
		headers: {
			location: `/room/${gameID}`
		}
	};
};
