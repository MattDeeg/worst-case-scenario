import type { UserMeta } from '$lib/firebase/docTypes/GameMeta';

type Acc = [string, { lastVictimAt: number; active: boolean }];

export const nextVictim = (users: Record<string, UserMeta>): string => {
	const entries = Object.entries(users);
	const anyNonVictims = entries.filter(([, user]) => user && user.lastVictimAt == null);
	if (anyNonVictims.length > 0) {
		const idx = Math.floor(Math.random() * anyNonVictims.length);
		return anyNonVictims[idx][0];
	}

	return (entries as Acc[]).reduce(
		(acc, entry) => {
			const user = entry[1];
			if (user.active && user.lastVictimAt < acc[1].lastVictimAt) {
				return entry;
			}
			return acc;
		},
		['', { lastVictimAt: Infinity, active: true }] as Acc
	)[0];
};
