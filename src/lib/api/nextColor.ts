import type { Game } from '$lib/firebase/docTypes/Game';

const colors = [
	'#c51111',
	'#132ed1',
	'#117f2d',
	'#ed54ba',
	'#ef7d0d',
	'#c28722',
	'#3f474e',
	'#8394bf',
	'#6b2fbb',
	'#71f91e',
	'#24a8be',
	'#15a742'
];

export const getColorFor = (index: number) => {
	return colors[index % colors.length];
};

export const nextColor = (game: Game) => {
	const currentUsers = Object.keys(game.users).length;
	return getColorFor(currentUsers);
};
