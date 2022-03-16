import type { RequestHandler } from '@sveltejs/kit';
import { database } from '$lib/firebase/server';
import { wrapDatabase } from '$lib/firebase/dbTypes/Accessor';
import { asSuccess, successResponse } from '$lib/utils';
import type { DecisionToken } from '$lib/firebase/dbTypes/Database';
import { scoreRound } from '$lib/api/scoreRound';

export interface Payload {
	gameID: string;
	index: number;
}

export const post: RequestHandler = async (event) => {
	const payload: Payload = await event.request.json();
	const userID = event.locals.userID;
	const { gameID, index } = payload;

	if (!gameID || index == null) {
		return successResponse(false, 'invalid data');
	}

	const db = wrapDatabase(database);
	const gameRef = db.games[gameID];

	const victimSnap = await gameRef.round.victim.get();

	if (!victimSnap.exists()) {
		return successResponse(false, 'game does not exist');
	}
	if (victimSnap.val() !== userID) {
		return successResponse(false, 'player is not victim');
	}

	const revealed = (await gameRef.round.revealed.get()).val();
	// if (revealed?.[index] === true) {
	// 	return successResponse(true, 'was previously revealed');
	// }

	const updatedRevealed = revealed ?? [];
	updatedRevealed[index] = true;
	const allRevealed = updatedRevealed.length === 5 && updatedRevealed.every(Boolean);

	const tokens = (await gameRef.tokens.get()).val();
	const victimToken: DecisionToken = {
		userID,
		token: tokens[userID][index]
	};
	const otherTokens: DecisionToken[] = Object.entries(tokens)
		.map(([userID, tokens]) => ({
			userID,
			token: tokens[index]
		}))
		.filter((dt) => dt.userID !== userID);

	const success = await asSuccess(
		gameRef.round.update({
			revealed: updatedRevealed,
			decision: {
				cardIndex: index,
				victim: victimToken,
				others: otherTokens
			}
		}),
		allRevealed &&
			gameRef.round.get().then((round) =>
				gameRef.scores.transaction((dbScores) => {
					const scores = dbScores ?? {};
					const roundScores = scoreRound(round.val(), tokens);
					for (const uid in roundScores) {
						scores[uid] = (scores[uid] ?? 0) + roundScores[uid];
					}
					console.log(roundScores, scores);
					return scores;
				})
			)
	);

	return successResponse(success);
};
