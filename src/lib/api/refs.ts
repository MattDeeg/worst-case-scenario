import type { Game } from '$lib/firebase/docTypes/Game';
import type { GameMeta } from '$lib/firebase/docTypes/GameMeta';
import type { GameVictim } from '$lib/firebase/docTypes/GameVictim';
import { store } from '$lib/firebase/server';

export const getGame = <T extends Game>(gameID: string) => store.doc<T>(`games/${gameID}`);
export const getVictim = (gameID: string) => store.doc<GameVictim>(`gameVictim/${gameID}`);
export const getMeta = (gameID: string) => store.doc<GameMeta>(`gameMeta/${gameID}`);

export const getAll = <T extends Game>(gameID: string) => ({
	gameRef: getGame<T>(gameID),
	victimRef: getVictim(gameID),
	metaRef: getMeta(gameID)
});
