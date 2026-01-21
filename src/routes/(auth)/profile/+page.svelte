<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    let auth: { user?: { id?: string; username?: string; email?: string } } | null = null;
    let user: { id?: string; username?: string; email?: string } | null = null;
    let profileUser: { profileImage?: string } | null = null;
    let profileImages: { id: string; imageUrl: string }[] = [];
    let previewUrl = '';
    let uploading = false;

    function readAuth() {
        try {
            const raw = localStorage.getItem('app_auth');
            auth = raw ? JSON.parse(raw) : null;
            user = auth?.user ?? null;
        } catch {
            auth = null;
            user = null;
        }
    }

    async function fetchProfile() {
        readAuth();
        if (!user?.id) return;
        try {
            const res = await fetch(`/api/user/${user.id}`);
            if (res.ok) {
                const json = await res.json();
                profileUser = json.user;
                profileImages = json.images ?? [];
            }
        } catch (err) {
            console.error('fetchProfile error', err);
        }
    }

    onMount(() => {
        fetchProfile();
        const onStorage = (e: StorageEvent) => {
            if (e.key === 'app_auth') fetchProfile();
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    });

    function handleFile(e: Event) {
        const input = e.target as HTMLInputElement;
        const f = input.files?.[0];
        previewUrl = f ? URL.createObjectURL(f) : '';
    }

    function goBack() {
        goto('/characters');
    }

    function onSubmitStart() {
        uploading = true;
    }
</script>

<div class="page-container">
    <section class="profile-card-main">
        <header class="profile-header">
            <button class="back-link" on:click={goBack}>
                <span class="icon">←</span> Tillbaka
            </button>
            <h1>Användarprofil</h1>
        </header>

        {#if !user}
            <div class="glass-panel not-logged">
                <p>Du måste vara inloggad för att se detta.</p>
                <a href="/login" class="btn primary">Logga in här</a>
            </div>
        {:else}
            <div class="profile-content">
                <div class="user-sidebar">
                    <div class="avatar-container">
                        <div class="avatar-glow"></div>
                        {#if profileUser?.profileImage}
                            <img class="avatar-img" src={profileUser.profileImage} alt="Profilbild" />
                        {:else}
                            <div class="avatar-fallback">{user.username?.slice(0, 1).toUpperCase()}</div>
                        {/if}
                    </div>
                    
                    <div class="user-details">
                        <h2 class="username">{user.username}</h2>
                        <p class="email">{user.email}</p>
                        <span class="badge">Medlem</span>
                    </div>
                </div>

                <div class="upload-section">
                    <form method="POST" enctype="multipart/form-data" class="glass-form" on:submit={onSubmitStart}>
                        <h3 class="section-title">Uppdatera profilbild</h3>
                        <input type="hidden" name="userId" value={user.id} />
                        
                        <label class="custom-file-upload">
                            <input type="file" name="image" accept="image/*" on:change={handleFile} />
                            <span>{previewUrl ? 'Bild vald!' : 'Välj ny bild...'}</span>
                        </label>

                        {#if previewUrl}
                            <div class="preview-container">
                                <img src={previewUrl} alt="preview" class="preview-img" />
                            </div>
                        {/if}

                        <button class="btn primary full-width" type="submit" formaction="?/upload" disabled={uploading}>
                            {uploading ? 'Laddar upp...' : 'Spara ny bild'}
                        </button>
                        <p class="hint">JPG, PNG eller WEBP (Max 10MB)</p>
                    </form>
                </div>
            </div>

            <div class="gallery-wrapper">
                <h2 class="section-title">Bildhistorik</h2>
                <div class="gallery-grid">
                    {#if profileImages.length === 0}
                        <div class="glass-panel empty-state">Här var det tomt! Dina tidigare bilder hamnar här.</div>
                    {/if}

                    {#each profileImages as img}
                        <div class="gallery-item">
                            <img src={img.imageUrl} alt="historik" />
                            <div class="item-overlay">
                                <form method="POST">
                                    <input type="hidden" name="imageId" value={img.id} />
                                    <button type="submit" class="btn-delete" formaction="?/remove">Ta bort</button>
                                </form>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
    </section>
</div>

<style>
    /* Global känsla */
    :global(body) {
        background: #020617;
        background-image: 
            radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(124, 58, 237, 0.15) 0px, transparent 50%);
        font-family: 'Inter', sans-serif;
    }

    .page-container {
        min-height: 100vh;
        padding: 2rem 1rem;
        display: flex;
        justify-content: center;
    }

    .profile-card-main {
        width: 100%;
        max-width: 900px;
    }

    /* Header */
    .profile-header {
        display: flex;
        align-items: center;
        gap: 2rem;
        margin-bottom: 2rem;
    }

    .profile-header h1 {
        font-size: 1.8rem;
        font-weight: 800;
        color: white;
        margin: 0;
    }

    .back-link {
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        font-weight: 600;
        transition: color 0.2s;
    }

    .back-link:hover { color: #3b82f6; }

    /* Layout-grid */
    .profile-content {
        display: grid;
        grid-template-columns: 300px 1fr;
        gap: 2rem;
        margin-bottom: 3rem;
    }

    /* Sidebar & Avatar */
    .user-sidebar {
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 1.5rem;
        padding: 2rem;
        text-align: center;
    }

    .avatar-container {
        position: relative;
        width: 150px;
        height: 150px;
        margin: 0 auto 1.5rem;
    }

    .avatar-glow {
        position: absolute;
        inset: -5px;
        background: linear-gradient(45deg, #3b82f6, #8b5cf6);
        border-radius: 50%;
        filter: blur(10px);
        opacity: 0.5;
    }

    .avatar-img, .avatar-fallback {
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid #1e293b;
    }

    .avatar-fallback {
        background: #1e293b;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 3rem;
        font-weight: bold;
        color: #3b82f6;
    }

    .username { color: white; margin: 0; font-size: 1.5rem; }
    .email { color: #94a3b8; font-size: 0.9rem; margin-top: 0.5rem; }
    .badge {
        display: inline-block;
        margin-top: 1rem;
        padding: 0.25rem 0.75rem;
        background: rgba(59, 130, 246, 0.1);
        color: #60a5fa;
        border-radius: 2rem;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
    }

    /* Form & Inputs */
    .glass-form {
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 2rem;
        border-radius: 1.5rem;
        height: 100%;
    }

    .section-title { color: white; font-size: 1.2rem; margin-bottom: 1.5rem; }

    .custom-file-upload {
        display: block;
        padding: 1rem;
        background: #0f172a;
        border: 2px dashed #334155;
        border-radius: 0.75rem;
        text-align: center;
        cursor: pointer;
        color: #94a3b8;
        transition: border-color 0.2s;
    }

    .custom-file-upload:hover { border-color: #3b82f6; }
    .custom-file-upload input { display: none; }

    .preview-container { margin: 1rem 0; text-align: center; }
    .preview-img { max-height: 150px; border-radius: 0.75rem; border: 2px solid #3b82f6; }

    /* Knappar */
    .btn {
        padding: 0.75rem 1.5rem;
        border-radius: 0.75rem;
        font-weight: 700;
        cursor: pointer;
        border: none;
        transition: transform 0.1s, filter 0.2s;
    }

    .btn:active { transform: scale(0.98); }

    .btn.primary {
        background: linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%);
        color: white;
        box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
    }

    .btn.primary:hover { filter: brightness(1.1); }
    .full-width { width: 100%; }

    /* Galleri */
    .gallery-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 1rem;
    }

    .gallery-item {
        position: relative;
        aspect-ratio: 1;
        border-radius: 1rem;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .gallery-item img { width: 100%; height: 100%; object-fit: cover; }

    .item-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s;
    }

    .gallery-item:hover .item-overlay { opacity: 1; }

    .btn-delete {
        background: #ef4444;
        color: white;
        border: none;
        padding: 0.5rem 0.75rem;
        border-radius: 0.5rem;
        font-size: 0.8rem;
        font-weight: bold;
        cursor: pointer;
    }

    .hint { font-size: 0.8rem; color: #64748b; margin-top: 1rem; text-align: center; }

    /* Responsivitet */
    @media (max-width: 768px) {
        .profile-content { grid-template-columns: 1fr; }
        .user-sidebar { order: -1; }
    }
</style>