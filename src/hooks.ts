import cookie from 'cookie';
import type { GetSession, Handle } from '@sveltejs/kit';
import { store, database } from '$lib/firebase/server';
import { wrapDatabase } from '$lib/firebase/dbTypes/Accessor';

export const getSession: GetSession = (event) => {
	const userID = event.locals.userID;

	return { userID };
};

export const handle: Handle = async ({ event, resolve }) => {
	const cookieHeaders = event.request.headers.get('cookie') || '';
	const cookies = cookie.parse(cookieHeaders);

	const userID = cookies.userID || store.generateID();
	event.locals = { userID, database: wrapDatabase(database) };

	const response = await resolve(event);
	const expires = new Date(Date.now() + 3.154e10); // + 1 year
	response.headers.append(
		'set-cookie',
		cookie.serialize('userID', userID, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			expires
		})
	);

	if (event.params.gameID) {
		const ref = store.doc(`games/${event.params.gameID}`);
		const doc = await ref.get();
		if (!doc.exists) {
			return new Response(null, {
				status: 301,
				headers: {
					location: '/?error=nogame'
				}
			});
		}
	}

	return response;
};
