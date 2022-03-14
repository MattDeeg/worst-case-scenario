import type { RequestHandler } from '@sveltejs/kit';
import { store, validateDocumentID } from '$lib/firebase/server';
import type { GameType, LobbyGame, User } from '$lib/firebase/docTypes/Game';
import { getString } from '$lib/api/readFormData';
import { getColorFor } from '$lib/api/nextColor';
import { getGame, getMeta, getVictim } from '$lib/api/refs';

export const post: RequestHandler = async (event) => {
	const formData = await event.request.formData();

	const userID = event.locals.userID;
	const gameID = getString(formData, 'gameID');
	const displayName = getString(formData, 'displayName');
	// todo
	const type: GameType = 'competitive';
	const allowedPacks: string[] = ['Base Game'];

	if (!userID || !type || !displayName) {
		return {
			status: 302,
			headers: {
				location: '/?error=data'
			}
		};
	}

	let gameDoc = store.collectionDoc<LobbyGame>('games');
	if (gameID) {
		if (!validateDocumentID(gameID)) {
			return {
				status: 302,
				headers: {
					location: '/?error=invalidRoomID'
				}
			};
		}
		gameDoc = getGame(gameID);
	}

	const startUser: User = {
		id: userID,
		host: true,
		color: getColorFor(0),
		displayName,
		score: 0,
		ready: false
	};

	await Promise.all([
		gameDoc.set({
			id: gameDoc.id,
			type,
			users: {
				[userID]: startUser
			}
		}),
		getMeta(gameID).set({
			victim: '',
			bonusType: 0,
			decisions: {},
			users: {},
			allowedPacks
		}),
		getVictim(gameID).set({
			victim: '',
			cards: [],
			readyToReveal: false,
			revealed: [false, false, false, false, false],
			allowedPacks
		})
	]);

	return {
		status: 302,
		headers: {
			location: `/room/${encodeURI(gameDoc.id)}`
		}
	};
};
