export interface UserDecisions {
	tokens: number[];
}

export interface UserMeta {
	lastVictimAt?: number;
	active: boolean;
	color: string;
}

export interface GameMeta {
	victim: string;
	bonusType: number;
	users: Record<string, UserMeta>;
	decisions: Record<string, UserDecisions>;
	allowedPacks: string[];
}
