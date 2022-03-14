import type { Predicament } from './Predicament';

export interface GameVictim {
	victim: string;
	cards: Predicament[];
	readyToReveal: boolean;
	revealed: boolean[];
	allowedPacks: string[];
}
