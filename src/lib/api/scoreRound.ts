import type { Round, TokenValue } from '$lib/firebase/dbTypes/Database';

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
	const correctCard = correct[value];
	const guessCard = guesses[value];
	return correctCard === guessCard;
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

const scoreFunctions = [theFourIsMore, allIsBonus, badIsGood, scoreYourChips, tripleUp, doubleUp];

export const getBonusType = (): number => {
	return Math.floor(Math.random() * (scoreFunctions.length - 1));
};

export const scoreRound = (
	round: Round,
	tokens: Record<string, TokenValue[]>
): Record<string, number> => {
	const victim = round.victim;
	const entries = Object.entries(tokens);
	const correctOrder = tokens[victim];
	const scoreFunction = scoreFunctions[round.bonusType];

	const players = entries.filter(([key]) => key !== victim);
	const scored: [string, number][] = players.map(([key, tokens]) => [
		key,
		scoreFunction(correctOrder, tokens)
	]);

	const maxScore = Math.max(...scored.map(([, v]) => v));
	const withVictim: [string, number][] = [...scored, [victim, maxScore]];
	return Object.fromEntries(withVictim);
};
