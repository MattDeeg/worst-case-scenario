type Acc = [string, number];

export const nextVictim = (users: Record<string, number>): string => {
	const entries = Object.entries(users);
	const anyNonVictims = entries.filter(([, lastVictimAt]) => lastVictimAt === 0);
	if (anyNonVictims.length > 0) {
		const idx = Math.floor(Math.random() * anyNonVictims.length);
		return anyNonVictims[idx][0];
	}

	return (entries as Acc[]).reduce((acc, entry) => (entry[1] < acc[1] ? entry : acc), [
		'',
		Infinity
	] as Acc)[0];
};
