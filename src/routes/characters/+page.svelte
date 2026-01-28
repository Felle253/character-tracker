<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    export let data;

    let auth: {
        user?: { id?: string; username?: string; email?: string };
        sessionId?: string;
    } | null = null;
    let user = null;
    let profileUser = null;
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
        goto('/');
    }

    function goCreate() {
        if (!user) {
            goto('/login');
            return;
        }
        goto('/characters/create');
    }

    $: characters = data.characters ?? [];
    $: filtered = onlyMine
        ? user
            ? characters.filter((c) => c.ownerId === user.id)
            : []
        : characters;

    $: totalCount = characters.length;
    $: myCount = user ? characters.filter((c) => c.ownerId === user.id).length : 0;

    function toggleOnlyMine() {
        onlyMine = !onlyMine;
    }
</script>

<header class="site-header">
    <div class="header-inner">
        <div class="brand">
            <h1 class="brand-title">Character <span class="accent">Tracker</span></h1>
        </div>

        <nav class="site-nav">
            <button class="btn-toggle-filter {onlyMine ? 'active' : ''}" on:click={toggleOnlyMine}>
                {onlyMine ? 'Mina Karaktärer' : 'Alla Karaktärer'}
                <span class="count-badge">{onlyMine ? myCount : totalCount}</span>
            </button>

            <button class="btn-create" on:click={goCreate}>
                <span class="plus">+</span> Skapa ny
            </button>

            {#if user}
                <div class="user-pill">
                    <a href="/profile" class="avatar-link">
                        {#if profileUser?.profileImage}
                            <img src={profileUser.profileImage} alt="Profil" class="nav-avatar" />
                        {:else}
                            <div class="nav-avatar-fallback">{user.username?.slice(0, 1).toUpperCase()}</div>
                        {/if}
                    </a>
                    <div class="user-meta-nav">
                        <span class="nav-username">{user.username}</span>
                        <button class="logout-small" on:click={logout}>Logga ut</button>
                    </div>
                </div>
            {:else}
                <div class="auth-buttons">
                    <a href="/login" class="nav-link">Logga in</a>
                    <a href="/register" class="btn-outline">Gå med</a>
                </div>
            {/if}
        </nav>
    </div>
</header>

<main class="dashboard">
    <section class="hero-stats">
        {#if user}
            <div class="welcome-banner">
                <h2>Välkommen tillbaka, <span class="gradient-text">{user.username}</span></h2>
                <p>Du har <strong>{myCount}</strong> aktiva hjältar i din arsenal.</p>
            </div>
        {:else}
            <div class="welcome-banner">
                <h2>Utforska <span class="gradient-text">Galleriet</span></h2>
                <p>Logga in för att börja tracka dina egna vinster och förluster.</p>
            </div>
        {/if}
    </section>

    <ul class="character-grid">
        {#each filtered as c}
            <li class="character-card">
                <a href={`/characters/${c.id}`} class="card-content">
                    <div class="card-header">
                        <h3 class="name">{c.name}</h3>
                        <span class="win-rate-ring">{c.winRate}%</span>
                    </div>
                    
                    {#if c.description}
                        <p class="description">{c.description}</p>
                    {/if}

                    <div class="stats-row">
                        <div class="stat">
                            <span class="label">Matcher</span>
                            <span class="value">{c.total}</span>
                        </div>
                        <div class="stat">
                            <span class="label">Vinster</span>
                            <span class="value">{c.wins}</span>
                        </div>
                    </div>

                    <div class="card-footer">
                        {#if c.ownerName}
                            <span class="owner">👤 {c.ownerName}</span>
                        {/if}
                        <span class="view-more">Visa detaljer →</span>
                    </div>
                </a>
            </li>
        {/each}

        {#if filtered.length === 0}
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <p>Hittade inga karaktärer här.</p>
                {#if onlyMine && !user}
                    <a href="/login" class="btn-create">Logga in för att se dina</a>
                {/if}
            </div>
        {/if}
    </ul>
</main>

<style>
    :global(body) {
        background: #020617;
        color: #f8fafc;
        margin: 0;
    }

    .dashboard {
        max-width: 1100px;
        margin: 0 auto;
        padding: 2rem 1rem 6rem;
    }

    .site-header {
        background: rgba(15, 23, 42, 0.7);
        backdrop-filter: blur(15px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        padding: 0.75rem 0;
        position: sticky;
        top: 0;
        z-index: 100;
    }

    .header-inner {
        max-width: 1100px;
        margin: 0 auto;
        padding: 0 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .brand-title {
        font-size: 1.4rem;
        font-weight: 900;
        margin: 0;
        letter-spacing: -1px;
    }

    .accent { color: #3b82f6; }

    .site-nav {
        display: flex;
        align-items: center;
        gap: 1.5rem;
    }

    .btn-create {
        background: linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%);
        color: white;
        border: none;
        padding: 0.5rem 1.2rem;
        border-radius: 0.75rem;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .btn-toggle-filter {
        background: #1e293b;
        color: #94a3b8;
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 0.5rem 1rem;
        border-radius: 0.75rem;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s;
    }

    .btn-toggle-filter.active {
        background: rgba(59, 130, 246, 0.15);
        border-color: #3b82f6;
        color: #60a5fa;
    }

    .count-badge {
        background: rgba(255,255,255,0.1);
        padding: 0.1rem 0.4rem;
        border-radius: 0.4rem;
        margin-left: 0.5rem;
        font-size: 0.8rem;
    }

    .user-pill {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: rgba(255,255,255,0.03);
        padding: 0.25rem 0.75rem 0.25rem 0.25rem;
        border-radius: 2rem;
        border: 1px solid rgba(255,255,255,0.05);
    }

    .nav-avatar, .nav-avatar-fallback {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
    }

    .nav-avatar-fallback {
        background: #3b82f6;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
    }

    .user-meta-nav { display: flex; flex-direction: column; line-height: 1.1; }
    .nav-username { font-size: 0.85rem; font-weight: 700; }
    .logout-small { 
        background: none; border: none; color: #ef4444; font-size: 0.7rem; 
        padding: 0; cursor: pointer; text-align: left;
    }

    .welcome-banner { margin-bottom: 2.5rem; }
    .welcome-banner h2 { font-size: 2.2rem; margin: 0; }
    .gradient-text {
        background: linear-gradient(to right, #60a5fa, #a78bfa);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .welcome-banner p { color: #94a3b8; font-size: 1.1rem; }

    .character-grid {
        list-style: none;
        padding: 0;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
    }

    .character-card {
        background: rgba(30, 41, 59, 0.4);
        border: 1px solid rgba(255,255,255,0.05);
        border-radius: 1.25rem;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
    }

    .character-card:hover {
        transform: translateY(-5px);
        background: rgba(30, 41, 59, 0.6);
        border-color: rgba(59, 130, 246, 0.4);
        box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
    }

    .card-content {
        text-decoration: none;
        color: inherit;
        padding: 1.5rem;
        display: block;
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .name { font-size: 1.3rem; font-weight: 800; margin: 0; color: #f1f5f9; }

    .win-rate-ring {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
        padding: 0.4rem 0.8rem;
        border-radius: 2rem;
        font-size: 0.9rem;
        font-weight: 800;
        border: 1px solid rgba(16, 185, 129, 0.2);
    }

    .description {
        font-size: 0.9rem;
        color: #94a3b8;
        margin-bottom: 1.5rem;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .stats-row {
        display: flex;
        gap: 2rem;
        padding: 1rem 0;
        border-top: 1px solid rgba(255,255,255,0.05);
    }

    .stat { display: flex; flex-direction: column; }
    .stat .label { font-size: 0.7rem; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 1px; }
    .stat .value { font-size: 1.2rem; font-weight: 700; color: #e2e8f0; }

    .card-footer {
        margin-top: 1rem;
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        color: #64748b;
    }

    .view-more { color: #3b82f6; font-weight: 600; opacity: 0; transition: opacity 0.2s; }
    .character-card:hover .view-more { opacity: 1; }

    .empty-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: 4rem;
        background: rgba(15, 23, 42, 0.4);
        border-radius: 1.5rem;
        border: 2px dashed rgba(255,255,255,0.05);
    }
    .empty-icon { font-size: 3rem; margin-bottom: 1rem; }

    @media (max-width: 640px) {
        .header-inner { flex-direction: column; gap: 1rem; }
        .site-nav { width: 100%; justify-content: space-between; flex-wrap: wrap; }
    }
</style>