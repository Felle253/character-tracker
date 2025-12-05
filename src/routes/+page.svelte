<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	onMount(() => {
		goto('/characters');
	});
</script>

<h1>Redirecting...</h1>
<p>If you are not redirected, click <a href="/characters">here</a>.</p>

<style>
	h1 {
		text-align: center;
		color: #3498db;
	}
</style>
