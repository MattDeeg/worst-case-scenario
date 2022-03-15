/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#the-app-namespace
// for information about these interfaces
declare namespace App {
	import type { RefOf } from '$lib/firebase/dbTypes/Accessor';
	import type { DBSchema } from '$lib/firebase/dbTypes/Database';

	interface Locals {
		userID: string;
		database: RefOf<DBSchema>;
	}
	// interface Platform {}
	interface Session {
		userID: string;
	}
	// interface Stuff {}
}

type DeepPartial<T> = Partial<{ [P in keyof T]: DeepPartial<T[P]> }>;
