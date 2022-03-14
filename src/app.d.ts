/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#the-app-namespace
// for information about these interfaces
declare namespace App {
	interface Locals {
		userID: string;
	}
	// interface Platform {}
	interface Session {
		userID: string;
	}
	// interface Stuff {}
}

type DeepPartial<T> = Partial<{ [P in keyof T]: DeepPartial<T[P]> }>;
