import type { RequestHandler } from '@sveltejs/kit';
import { getCard } from '$lib/api/generateHand';
import type { JSONValue } from '@sveltejs/kit/types/internal';

export const post: RequestHandler = async () => {
	const card = await getCard(['Base Game']);

	return { body: { success: true, card: card as unknown as JSONValue } };
};
