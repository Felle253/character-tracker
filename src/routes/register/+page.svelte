<script lang="ts">
    import { goto } from '$app/navigation';
    let username = '';
    let password = '';
    let email = '';
    let file: File | null = null;
    let preview = '';

    function handleFile(e: Event) {
        const target = e.target as HTMLInputElement;
        const f = target.files?.[0];
        if (f) {
            file = f;
            preview = URL.createObjectURL(f);
        } else {
            file = null;
            preview = '';
        }
    }

    async function submit(e: Event) {
        e.preventDefault();
        const form = new FormData();
        form.set('username', username);
        form.set('password', password);
        form.set('email', email);
        if (file) form.set('image', file);

        const res = await fetch('/register', { method: 'POST', body: form });
        const body = await res.json();
        if (!res.ok) {
            alert(body.error ?? 'Register failed');
            return;
        }

        localStorage.setItem(
            'app_auth',
            JSON.stringify({ user: body.user, sessionId: body.sessionId })
        );
        goto('/characters');
    }
</script>

<div class="auth-page">
    <section class="auth-card glass-panel">
        <header class="auth-header">
            <h1>Skapa <span class="accent">Konto</span></h1>
            <p>Börja din resa och tracka dina framsteg idag.</p>
        </header>

        <form on:submit|preventDefault={submit} class="auth-form" enctype="multipart/form-data">
            
            <div class="avatar-upload">
                <div class="avatar-preview-wrapper">
                    {#if preview}
                        <img src={preview} alt="preview" class="avatar-preview" />
                    {:else}
                        <div class="avatar-placeholder">
                            <span>{username ? username.slice(0,1).toUpperCase() : '?'}</span>
                        </div>
                    {/if}
                    <label for="file-upload" class="upload-badge" title="Ladda upp bild">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    </label>
                </div>
                <input id="file-upload" type="file" accept="image/png,image/jpeg,image/webp" on:change={handleFile} class="hidden-input" />
            </div>

            <div class="field">
                <label for="username">Användarnamn</label>
                <input id="username" bind:value={username} placeholder="Välj ett namn..." required />
            </div>

            <div class="field">
                <label for="email">E-post <span class="optional">(valfritt)</span></label>
                <input id="email" type="email" bind:value={email} placeholder="hero@example.com" />
            </div>

            <div class="field">
                <label for="password">Lösenord</label>
                <input id="password" type="password" bind:value={password} placeholder="••••••••" required />
            </div>

            <div class="actions">
                <button type="submit" class="btn-primary">
                    Registrera
                    <div class="btn-glow"></div>
                </button>
                <a href="/login" class="link-login">Har du redan ett konto? Logga in</a>
            </div>
        </form>
    </section>
</div>

<style>
    .auth-page {
        min-height: calc(100vh - 150px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem 1rem;
    }

    .glass-panel {
        background: rgba(15, 23, 42, 0.7);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .auth-card {
        width: 100%;
        max-width: 420px;
        padding: 2.5rem;
        border-radius: 1.5rem;
    }

    .auth-header {
        text-align: center;
        margin-bottom: 2rem;
    }

    h1 { font-size: 2rem; font-weight: 800; margin: 0; color: white; }
    .accent { color: #3b82f6; }
    .auth-header p { color: #64748b; font-size: 0.95rem; margin-top: 0.5rem; }

    .avatar-upload {
        display: flex;
        justify-content: center;
        margin-bottom: 2rem;
    }

    .avatar-preview-wrapper {
        position: relative;
        width: 100px;
        height: 100px;
    }

    .avatar-preview, .avatar-placeholder {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid #1e293b;
        background: #0f172a;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        font-weight: 800;
        color: #3b82f6;
        box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
    }

    .upload-badge {
        position: absolute;
        bottom: 0;
        right: 0;
        background: #3b82f6;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border: 3px solid #0f172a;
        transition: transform 0.2s;
    }

    .upload-badge:hover { transform: scale(1.1); background: #2563eb; }
    .hidden-input { display: none; }

    .auth-form { display: flex; flex-direction: column; gap: 1.25rem; }
    .field { display: flex; flex-direction: column; gap: 0.5rem; }
    
    label { font-size: 0.8rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
    .optional { text-transform: none; font-weight: 400; opacity: 0.6; }

    input {
        width: 100%;
        padding: 0.8rem 1rem;
        background: rgba(7, 16, 39, 0.6);
        border: 1px solid #1e293b;
        border-radius: 0.75rem;
        color: white;
        font-size: 1rem;
        transition: all 0.2s;
    }

    input:focus { outline: none; border-color: #3b82f6; background: rgba(7, 16, 39, 0.9); box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }

    .actions { display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; }

    .btn-primary {
        position: relative;
        padding: 1rem;
        background: linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%);
        border: none;
        border-radius: 0.75rem;
        color: white;
        font-weight: 700;
        font-size: 1rem;
        cursor: pointer;
        overflow: hidden;
        transition: transform 0.2s;
    }

    .btn-primary:hover { transform: translateY(-2px); }
    .btn-glow { position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent); transition: 0.5s; }
    .btn-primary:hover .btn-glow { left: 100%; }

    .link-login { text-align: center; color: #64748b; text-decoration: none; font-size: 0.9rem; transition: color 0.2s; }
    .link-login:hover { color: #3b82f6; }
</style>