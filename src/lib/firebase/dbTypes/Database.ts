export type TokenValue = -1 | 0 | 1 | 2 | 3 | 4;
export const isTokenValue = (n: number): n is TokenValue => n > -1 && n < 5;

export interface DecisionToken {
	userID: string;
	token: TokenValue;
}
export interface Decision {
	cardIndex: number;
	victim: DecisionToken;
	others: DecisionToken[];
}

export interface User {
	name: string;
	color: string;
}

export interface Round {
	id: string;
	cards: string[];
	bonusType: number;
	victim: string;
	revealed: boolean[];
	decision: Decision;
}

export interface CardData {
	ids?: string[];
	allowedPacks: string[];
}

export interface Game {
	players: {
		count: number;
		users: Record<string, User>;
	};
	cards: CardData;
	round: Round;
	scores: Record<string, number>;
	victims: Record<string, number>;
	ready: Record<string, boolean>;
	tokens: Record<string, TokenValue[]>;
}

export interface DBSchema {
	games: Record<string, Game>;
}
