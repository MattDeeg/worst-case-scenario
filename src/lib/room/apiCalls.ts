import type { Predicament } from '$lib/firebase/docTypes/Predicament';

export const lockIn = (gameID: string) => (tokens: number[]) =>
	fetch('/api/lockIn', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json;charset=utf-8'
		},
		body: JSON.stringify({ gameID, tokens })
	})
		.then((res) => res.json())
		.then((r) => r.success);

export const redrawCards = (gameID: string) => () =>
	fetch('/api/redrawCards', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json;charset=utf-8'
		},
		body: JSON.stringify({ gameID })
	})
		.then((res) => res.json())
		.then((r) => r.success);

export const startRound = (gameID: string) => (cards: Predicament[]) =>
	fetch('/api/startRound', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json;charset=utf-8'
		},
		body: JSON.stringify({ gameID, cards })
	})
		.then((res) => res.json())
		.then((r) => r.success);

export const nextRound = (gameID: string) => () =>
	fetch('/api/nextRound', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json;charset=utf-8'
		},
		body: JSON.stringify({ gameID })
	})
		.then((res) => res.json())
		.then((r) => r.success);

export const revealDecision = (gameID: string) => (index: number) =>
	fetch('/api/revealDecision', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json;charset=utf-8'
		},
		body: JSON.stringify({ gameID, index })
	})
		.then((res) => res.json())
		.then((r) => r.success);

export interface GameApi {
	lockIn: (tokens: number[]) => Promise<boolean>;
	redrawCards: () => Promise<boolean>;
	startRound: (cards: Predicament[]) => Promise<boolean>;
	nextRound: () => Promise<boolean>;
	revealDecision: (index: number) => Promise<boolean>;
}

export const withGame = (gameID: string): GameApi => ({
	lockIn: lockIn(gameID),
	redrawCards: redrawCards(gameID),
	startRound: startRound(gameID),
	nextRound: nextRound(gameID),
	revealDecision: revealDecision(gameID)
});
