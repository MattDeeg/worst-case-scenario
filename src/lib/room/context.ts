import { getContext, setContext } from 'svelte';
import type { Readable } from 'svelte/store';
import type { Round, User } from '$lib/firebase/dbTypes/Database';
import type { ApiWrapper } from './apiCalls';
import type { CrossfadeParams, TransitionConfig } from 'svelte/transition';

const ROOM = Symbol('room');
const ANIMATION = Symbol('animation');
export const dataType = 'application/playertoken';

type AnimFunc = (
	node: Element,
	params: CrossfadeParams & {
		key: unknown;
	}
) => () => TransitionConfig;

type AnimContext = { send: AnimFunc; receive: AnimFunc };

const noop: AnimFunc = () => () => ({});

export const setAnimationContext = (ctx: AnimContext) => setContext(ANIMATION, ctx);
export const getAnimationContext = (): AnimContext =>
	getContext(ANIMATION) ?? { send: noop, receive: noop };

export interface UserWithID extends User {
	id: string;
}

interface RoomContext {
	gameID: string;
	userID: string;
	user: Readable<User>;
	users: Readable<UserWithID[]>;
	cards: Readable<string[]>;
	round: Readable<Round>;
	scores: Readable<Record<string, number>>;
	readiness: Readable<Record<string, boolean>>;
	allPlayersReady: Readable<boolean>;
	tokens: Readable<number[]>;
	api: ApiWrapper;
}
export const setRoomContext = (ctx: RoomContext) => setContext(ROOM, ctx);
export const getRoomContext = (): RoomContext => getContext(ROOM);
