<script lang="ts">
    import { goto } from '$app/navigation';
    let username = '';
    let password = '';
    let loading = false;

    async function submit(e: Event) {
        e.preventDefault();
        loading = true;
        
        const form = new FormData();
        form.set('username', username);
        form.set('password', password);

        try {
            const res = await fetch('/login', { method: 'POST', body: form });
            const body = await res.json();
            
            if (!res.ok) {
                alert(body.error ?? 'Inloggning misslyckades');
                return;
            }

            localStorage.setItem(
                'app_auth',
                JSON.stringify({ user: body.user, sessionId: body.sessionId })
            );
            goto('/characters');
        } finally {
            loading = false;
        }
    }
</script>

<div class="auth-page">
    <section class="auth-card glass-panel">
        <header class="auth-header">
            <div class="logo-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            </div>
            <h1>Välkommen <span class="accent">Tillbaka</span></h1>
            <p>Logga in för att hantera dina karaktärer.</p>
        </header>

        <form on:submit|preventDefault={submit} class="auth-form">
            <div class="field">
                <label for="username">Användarnamn</label>
                <div class="input-control">
                    <input 
                        id="username" 
                        bind:value={username} 
                        placeholder="Ditt användarnamn" 
                        required 
                    />
                </div>
            </div>

            <div class="field">
                <label for="password">Lösenord</label>
                <div class="input-control">
                    <input 
                        id="password" 
                        type="password" 
                        bind:value={password} 
                        placeholder="••••••••" 
                        required 
                    />
                </div>
            </div>

            <div class="actions">
                <button type="submit" class="btn-primary" disabled={loading}>
                    {#if loading}
                        <span class="loader"></span>
                    {:else}
                        Logga in
                    {/if}
                    <div class="btn-glow"></div>
                </button>
                
                <div class="footer-links">
                    <span class="muted">Inget konto än?</span>
                    <a href="/register" class="link-highlight">Skapa ett här</a>
                </div>
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
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
    }

    .auth-card {
        width: 100%;
        max-width: 400px;
        padding: 3rem 2.5rem;
        border-radius: 2rem;
    }

    .auth-header {
        text-align: center;
        margin-bottom: 2.5rem;
    }

    .logo-icon {
        background: rgba(59, 130, 246, 0.1);
        width: 64px;
        height: 64px;
        border-radius: 1.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem;
        border: 1px solid rgba(59, 130, 246, 0.2);
    }

    h1 { font-size: 1.8rem; font-weight: 800; margin: 0; color: white; letter-spacing: -0.5px; }
    .accent { color: #3b82f6; }
    .auth-header p { color: #64748b; font-size: 0.95rem; margin-top: 0.5rem; }

    .auth-form { display: flex; flex-direction: column; gap: 1.5rem; }
    .field { display: flex; flex-direction: column; gap: 0.5rem; }
    
    label { font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; }

    input {
        width: 100%;
        padding: 0.8rem 1.2rem;
        background: rgba(7, 16, 39, 0.6);
        border: 1px solid #1e293b;
        border-radius: 0.75rem;
        color: white;
        font-size: 1rem;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        box-sizing: border-box;
    }

    input:focus { 
        outline: none; 
        border-color: #3b82f6; 
        background: rgba(7, 16, 39, 0.9); 
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15); 
    }

    .actions { display: flex; flex-direction: column; gap: 1.5rem; margin-top: 1rem; }

    .btn-primary {
        position: relative;
        padding: 1rem;
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        border: none;
        border-radius: 0.75rem;
        color: white;
        font-weight: 700;
        font-size: 1rem;
        cursor: pointer;
        overflow: hidden;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.4); }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

    .btn-glow { 
        position: absolute; 
        top: 0; left: -100%; 
        width: 100%; height: 100%; 
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent); 
        transition: 0.6s; 
    }
    .btn-primary:hover .btn-glow { left: 100%; }

    .footer-links { text-align: center; font-size: 0.9rem; }
    .muted { color: #64748b; margin-right: 0.4rem; }
    .link-highlight { color: #3b82f6; text-decoration: none; font-weight: 600; transition: color 0.2s; }
    .link-highlight:hover { color: #60a5fa; text-decoration: underline; }

    .loader {
        width: 20px;
        height: 20px;
        border: 3px solid rgba(255,255,255,0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
</style>