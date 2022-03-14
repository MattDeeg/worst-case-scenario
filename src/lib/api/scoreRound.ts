import type { GameType } from '$lib/firebase/docTypes/Game';
import type { GameMeta } from '$lib/firebase/docTypes/GameMeta';

const baseScore = (correct: number[], guesses: number[]) => {
	let score = 0;
	for (let i = 0; i < correct.length; i++) {
		if (correct[i] === guesses[i]) {
			score += 1;
		}
	}
	return score;
};

const positionMatches = (correct: number[], guesses: number[], value: number) => {
	const correctIndex = correct.findIndex((n) => n === value);
	const guessIndex = guesses.findIndex((n) => n === value);
	return correctIndex === guessIndex;
};

// The 4 is more!
//   Players who match The Victim's #4 chip get a 4-point bonus.
const theFourIsMore = (correct: number[], guesses: number[]) => {
	let score = baseScore(correct, guesses);
	if (positionMatches(correct, guesses, 3)) {
		score += 4;
	}
	return score;
};

// All = Bonus!
//   Players who match all The Victim's chips get a 5-point bonus.
const allIsBonus = (correct: number[], guesses: number[]) => {
	let score = baseScore(correct, guesses);
	if (score === 5) {
		score += 5;
	}
	return score;
};

// Bad is Good!
//   Players who match the victim's #1 chip get a 1-point bonus.
const badIsGood = (correct: number[], guesses: number[]) => {
	let score = baseScore(correct, guesses);
	if (positionMatches(correct, guesses, 0)) {
		score += 1;
	}
	return score;
};

// Triple Up!
//   All players triple their points
const tripleUp = (correct: number[], guesses: number[]) => {
	return baseScore(correct, guesses) * 3;
};

// Double Up!
//   All players double their points
const doubleUp = (correct: number[], guesses: number[]) => {
	return baseScore(correct, guesses) * 2;
};

// Score Your Chips
//   Your point total equals the numbers shown on all your matching chips.
const scoreYourChips = (correct: number[], guesses: number[]) => {
	let score = 0;
	for (let i = 0; i < correct.length; i++) {
		if (correct[i] === guesses[i]) {
			score += correct[i] + 1;
		}
	}
	return score;
};

const scoreFunctions = [
	baseScore,
	theFourIsMore,
	allIsBonus,
	badIsGood,
	scoreYourChips,
	tripleUp,
	doubleUp
];

export const getBonusType = (type: GameType): number => {
	if (type === 'casual') {
		return 0;
	} else {
		return 1 + Math.floor(Math.random() * scoreFunctions.length - 2);
	}
};

export const scoreRound = (game: GameMeta): Record<string, number> => {
	const victim = game.victim;
	const entries = Object.entries(game.decisions);
	const correctOrder = game.decisions[victim].tokens;
	const scoreFunction = scoreFunctions[game.bonusType];

	console.log(game.bonusType);

	const players = entries.filter(([key]) => key !== victim);
	const scored: [string, number][] = players.map(([key, { tokens }]) => [
		key,
		scoreFunction(correctOrder, tokens)
	]);

	const maxScore = Math.max(...scored.map(([, v]) => v));
	const withVictim: [string, number][] = [...scored, [victim, maxScore]];
	return Object.fromEntries(withVictim);
};
