<script lang="ts">
	import '../app.scss';
	import { browser } from '$app/env';
</script>

{#if browser}
	<slot />
{/if}
