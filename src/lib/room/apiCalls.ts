import type { Payload as GetHandPayload } from 'src/routes/api/getHand';
import type { Payload as LockInPayload } from 'src/routes/api/lockIn';
import type { Payload as NextRoundPayload } from 'src/routes/api/nextRound';
import type { Payload as RevealDecisionPayload } from 'src/routes/api/revealDecision';
import type { Payload as SetHandPayload } from 'src/routes/api/setHand';
import type { Payload as SetTokenPayload } from 'src/routes/api/setToken';
import type { Payload as ReadyUserPayload } from 'src/routes/api/readyUser';
import type { Card } from '$lib/api/generateHand';

type WithoutGameID<T> = {
	[K in keyof T as Exclude<K, 'gameID'>]: T[K];
};

interface Api {
	getHand: ApiMethod<GetHandPayload, Card[]>;
	lockIn: ApiMethod<LockInPayload>;
	nextRound: ApiMethod<NextRoundPayload>;
	readyUser: ApiMethod<ReadyUserPayload>;
	revealDecision: ApiMethod<RevealDecisionPayload>;
	setHand: ApiMethod<SetHandPayload>;
	setToken: ApiMethod<SetTokenPayload>;
}
export type ApiWrapper = {
	[K in keyof Api]: Api[K];
};

type Response<T> = { success: boolean; data?: T };
type ApiMethod<P, R = null> = (payload?: WithoutGameID<P>) => Promise<Response<R>>;
const apiMethod =
	<T>(endpoint: string, gameID: string) =>
	async (payload: WithoutGameID<T> = null) => {
		return fetch(`/api/${endpoint}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json;charset=utf-8'
			},
			body: JSON.stringify({
				...payload,
				gameID
			})
		}).then((res) => res.json());
	};

export const api = (gameID: string): ApiWrapper => {
	return new Proxy(
		{},
		{
			get: (_object, key) => {
				return apiMethod(key as string, gameID);
			}
		}
	) as unknown as Record<keyof Api, ApiMethod<unknown>>;
};
