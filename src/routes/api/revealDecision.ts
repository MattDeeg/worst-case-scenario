import type { RequestHandler } from '@sveltejs/kit';
import { database } from '$lib/firebase/server';
import { wrapDatabase } from '$lib/firebase/dbTypes/Accessor';
import { asSuccess, successResponse } from '$lib/utils';
import type { DecisionToken, TokenValue } from '$lib/firebase/dbTypes/Database';
import { scoreRound } from '$lib/api/scoreRound';

export interface Payload {
	gameID: string;
	token: TokenValue;
}

export const post: RequestHandler = async (event) => {
	const payload: Payload = await event.request.json();
	const userID = event.locals.userID;
	const { gameID, token } = payload;

	if (!gameID || token == null) {
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
	if (revealed?.[token] === true) {
		return successResponse(true, 'was previously revealed');
	}

	const updatedRevealed = revealed ?? [];
	updatedRevealed[token] = true;
	const allRevealed = updatedRevealed.length === 5 && updatedRevealed.every(Boolean);

	const tokens = (await gameRef.tokens.get()).val();
	const cardIndex = tokens[userID][token];
	const victimToken: DecisionToken = {
		userID,
		token
	};
	const otherTokens: DecisionToken[] = Object.entries(tokens)
		.map(([userID, tokens]) => ({
			userID,
			token: tokens.indexOf(cardIndex) as TokenValue
		}))
		.filter((dt) => dt.userID !== userID && dt.token > -1);

	const success = await asSuccess(
		gameRef.round.update({
			revealed: updatedRevealed,
			decision: {
				cardIndex,
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
					return scores;
				})
			)
	);

	return successResponse(success);
};
