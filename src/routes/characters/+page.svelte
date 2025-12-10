<!-- src/routes/characters/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	export let data;

	// auth state (read from localStorage key "app_auth")
	let auth: {
		user?: { id?: string; username?: string; email?: string };
		sessionId?: string;
	} | null = null;
	let user = null;
	let profileUser = null;

	// filter state
	let onlyMine = false;

	function readAuth() {
		try {
			const raw = localStorage.getItem('app_auth');
			auth = raw ? JSON.parse(raw) : null;
			user = auth?.user ?? null;
		} catch (e) {
			auth = null;
			user = null;
		}
	}

	async function fetchProfile() {
		if (!user?.id) {
			profileUser = null;
			return;
		}
		try {
			const res = await fetch(`/api/user/${user.id}`);
			if (res.ok) {
				const json = await res.json();
				profileUser = json.user;
			}
		} catch (e) {
			console.warn('Could not fetch profile', e);
		}
	}

	onMount(() => {
		readAuth();
		fetchProfile();

		// keep sync across tabs
		const onStorage = (e: StorageEvent) => {
			if (e.key === 'app_auth') {
				readAuth();
				fetchProfile();
			}
		};
		window.addEventListener('storage', onStorage);
		return () => window.removeEventListener('storage', onStorage);
	});

	async function logout() {
		try {
			if (auth?.sessionId) {
				await fetch('/logout', {
					method: 'POST',
					body: new URLSearchParams({ sessionId: auth.sessionId })
				});
			}
		} catch (err) {
			console.warn('Logout request failed', err);
		}
		localStorage.removeItem('app_auth');
		readAuth();
		goto('/'); // return to home/login
	}

	function goCreate() {
		if (!user) {
			goto('/login');
			return;
		}
		goto('/characters/create');
	}

	$: characters = data.characters ?? [];

	// When onlyMine is true and user is present -> filter by ownerId
	// If onlyMine is true and no user -> intentionally return empty array (per your request)
	$: filtered = onlyMine
		? user
			? characters.filter((c) => c.ownerId === user.id)
			: []
		: characters;

	// helper counts
	$: totalCount = characters.length;
	$: myCount = user ? characters.filter((c) => c.ownerId === user.id).length : 0;

	function toggleOnlyMine() {
		onlyMine = !onlyMine;
		// if toggling ON and not logged in we keep empty list (per request),
	}
</script>

<header class="site-header">
	<div class="brand" role="banner">
		<h1 class="brand-title">Character Tracker</h1>
	</div>

	<nav class="site-nav" aria-label="Main">
		<button class="btn create" on:click={goCreate} aria-label="Create character">Skapa ny</button>

		<!-- filter toggle -->
		<button
			class="btn toggle"
			on:click={toggleOnlyMine}
			aria-pressed={onlyMine}
			title={onlyMine
				? user
					? 'Visa alla'
					: 'Ingen inloggad — visar tomt'
				: 'Visa endast mina characters'}
		>
			{onlyMine ? 'Visar: Mina' : 'Visar: Alla'}
			{#if onlyMine && user}
				({myCount})
			{/if}
			{#if !onlyMine}
				({totalCount}){/if}
		</button>

		{#if user}
			<div class="user-block" aria-live="polite">
				<a href="/profile" class="avatar-link">
					{#if profileUser?.profileImage}
						<img
							src={profileUser.profileImage}
							alt="Profilbild"
							class="avatar-img"
							style="width:38px;height:38px;border-radius:999px;object-fit:cover;cursor:pointer"
						/>
					{:else}
						<div class="avatar" title={user.username} style="cursor:pointer">
							{user.username?.slice(0, 1).toUpperCase()}
						</div>
					{/if}
				</a>

				<div class="user-info">
					<div class="user-name">{user.username}</div>
					<div class="user-email">{user.email}</div>
				</div>
				<button class="btn ghost" on:click={logout} aria-label="Log out">Logga ut</button>
			</div>
		{:else}
			<div class="auth-links">
				<a href="/login" class="link">Logga in</a>
				<a href="/register" class="link muted">Registrera</a>
			</div>
		{/if}
	</nav>
</header>

<main class="container">
	<section class="intro">
		{#if user}
			<p class="welcome">
				Inloggad som <strong>{user.username}</strong>. {#if onlyMine}Visar dina characters ({myCount}).{:else}Visar
					alla characters ({totalCount}).{/if}
			</p>
		{:else if onlyMine}
			<p class="welcome warning">
				Du är inte inloggad — ingen character visas när "Visa mina" är aktiv.
			</p>
		{:else}
			<p class="welcome">
				Inte inloggad, <a href="/login" class="inline-link">Logga in</a> eller
				<a href="/register" class="inline-link">registrera</a> för att skapa och äga characters.
			</p>
		{/if}
	</section>

	<ul class="grid">
		{#each filtered as c}
			<li class="card">
				<a href={`/characters/${c.id}`} class="card-link">
					<div class="card-title">{c.name}</div>
					{#if c.description}<div class="card-desc">{c.description}</div>{/if}
					<div class="card-meta">
						<span class="muted">Matches: {c.total}</span>
						<span class="muted">Wins: {c.wins}</span>
						<span class="muted">Win rate: <strong>{c.winRate}%</strong></span>
						{#if c.ownerName}
							<span class="muted">Owner: {c.ownerName}</span>
						{/if}
					</div>
				</a>
			</li>
		{/each}

		{#if filtered.length === 0}
			<li class="empty">
				{#if onlyMine && !user}
					Inga items att visa — logga in först.
				{:else}
					Inga characters matchar ditt filter.
				{/if}
			</li>
		{/if}
	</ul>
</main>

<style>
	:global(body) {
		background: radial-gradient(1200px 600px at 10% 10%, #061226, #071027);
	}

	.site-header {
		max-width: 90rem;
		margin: 1.5rem auto;
		padding: 1rem 1.25rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		color: #e6eef8;
		border-radius: 0.5rem;
	}

	.brand {
		display: flex;
		flex-direction: column;
	}
	.brand-title {
		margin: 0;
		color: #7dd3fc;
		font-size: 1.25rem;
		letter-spacing: -0.5px;
	}

	.site-nav {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.btn {
		padding: 0.45rem 0.8rem;
		border-radius: 0.45rem;
		border: none;
		cursor: pointer;
		font-weight: 600;
		background: #1e3a8a;
		color: white;
	}
	.btn.ghost {
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.06);
		color: #e6eef8;
	}
	.btn.create {
		background: linear-gradient(90deg, #2563eb, #7c3aed);
	}
	.btn.toggle {
		background: #0b2747;
		color: #cfe8ff;
		border: 1px solid rgba(255, 255, 255, 0.04);
	}

	.user-block {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding-left: 0.5rem;
	}
	.avatar {
		width: 38px;
		height: 38px;
		border-radius: 999px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #0ea5a9;
		color: #021124;
		font-weight: 800;
	}
	.user-info {
		display: flex;
		flex-direction: column;
		line-height: 1;
		font-size: 0.85rem;
		color: #cfe8ff;
	}
	.user-name {
		font-weight: 700;
	}
	.user-email {
		color: #9fb6ce;
		font-size: 0.78rem;
	}

	.auth-links {
		display: flex;
		gap: 0.6rem;
		align-items: center;
	}
	.link {
		color: #cfe8ff;
		text-decoration: none;
		font-weight: 600;
	}
	.link.muted {
		color: #94a3b8;
		font-weight: 500;
	}

	.container {
		max-width: 90rem;
		margin: 1rem auto 3rem;
		padding: 1.25rem;
		background: #0f172a;
		color: #f8fafc;
		border-radius: 0.75rem;
		border: 1px solid #233240;
	}

	.intro {
		margin-bottom: 1rem;
	}
	.welcome {
		margin: 0 0 0.5rem 0;
		color: #cbd5e1;
	}
	.warning {
		color: #fca5a5;
	}

	.grid {
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
	}
	.card {
		background: #0b1220;
		border: 1px solid #22303f;
		padding: 1rem;
		border-radius: 0.5rem;
		transition:
			transform 0.12s ease,
			box-shadow 0.12s ease;
	}
	.card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 20px rgba(2, 6, 23, 0.6);
	}
	.card-link {
		color: inherit;
		text-decoration: none;
		display: block;
	}
	.card-title {
		font-weight: 700;
		color: #60a5fa;
		margin-bottom: 0.25rem;
	}
	.card-desc {
		color: #94a3b8;
		font-size: 0.9rem;
		margin-bottom: 0.5rem;
	}
	.card-meta {
		display: flex;
		gap: 0.75rem;
		color: #cbd5e1;
		font-size: 0.85rem;
	}
	.muted {
		color: #94a3b8;
	}
	.empty {
		color: #94a3b8;
		padding: 1rem;
	}
</style>
