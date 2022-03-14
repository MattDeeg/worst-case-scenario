import type { Predicament } from './Predicament';

export type GameType = 'casual' | 'competitive';
export interface LobbyGame {
	id: string;
	type: GameType;
	users: Record<string, User>;
}

export type Value = 0 | 1 | 2 | 3 | 4;
export interface DecisionToken {
	color: string;
	value: Value;
}

export interface Decision {
	card: Predicament;
	victimToken: DecisionToken;
	guessers: DecisionToken[];
}

export interface RunningGame extends LobbyGame {
	cards: Predicament[];
	victim: string;
	round: number;
	bonusType: number;
	decision: Decision;
}

export type Game = LobbyGame | RunningGame;

export interface User {
	id: string;
	host: boolean;
	displayName: string;
	color: string;
	score: number;
	ready: boolean;
	lockedIn: boolean;
}

export const isGame = (_game: Game): _game is Game => true;
export const isLobbyGame = (game: Game): game is LobbyGame => (game as RunningGame).cards == null;
export const isRunningGame = (game: Game): game is RunningGame =>
	(game as RunningGame).cards != null;

const sortById = (a: User, b: User) => a.id.localeCompare(b.id);
export const sortedUsers = (game: Game, userID: string) => {
	const { [userID]: myUser, ...others } = game.users;
	return [myUser, ...Object.values(others).sort(sortById)];
};
