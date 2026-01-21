<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    let name = '';
    let description = '';
    let auth = null;
    let sessionId = '';
    let user = null;

    onMount(() => {
        const raw = localStorage.getItem('app_auth');
        if (!raw) {
            goto('/login');
            return;
        }
        auth = JSON.parse(raw);
        sessionId = auth.sessionId;
        user = auth.user;
    });

    function goBack() {
        goto('/characters');
    }
</script>

<div class="page-wrapper">
    <section class="create-card">
        <header class="form-header">
            <button class="btn-back" on:click={goBack}>← Tillbaka</button>
            <h1>Ny <span class="accent">Karaktär</span></h1>
            <p>Ge liv åt din nästa hjälte genom att fylla i detaljerna nedan.</p>
        </header>

        <form method="POST" class="cyber-form">
            <input type="hidden" name="sessionId" value={sessionId} />
            
            <div class="field-group">
                <label for="name">Namn på karaktären</label>
                <div class="input-wrapper">
                    <input 
                        id="name"
                        name="name" 
                        placeholder="t.ex. Shadow Walker"
                        bind:value={name} 
                        required 
                    />
                    <div class="focus-border"></div>
                </div>
            </div>

            <div class="field-group">
                <label for="description">Beskrivning <span class="optional">(valfritt)</span></label>
                <div class="input-wrapper">
                    <textarea 
                        id="description"
                        name="description" 
                        rows="4"
                        placeholder="Berätta lite om karaktärens bakgrund eller spelstil..."
                        bind:value={description}
                    ></textarea>
                    <div class="focus-border"></div>
                </div>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn-primary">
                    <span class="btn-text">Skapa Karaktär</span>
                    <span class="btn-glow"></span>
                </button>
                <a href="/characters" class="link-cancel">Avbryt</a>
            </div>
        </form>
    </section>
</div>

<style>
    /* Wrapper för att centrera kortet vertikalt */
    .page-wrapper {
        min-height: calc(100vh - 200px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem 1rem;
    }

    .create-card {
        width: 100%;
        max-width: 500px;
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 1.5rem;
        padding: 2.5rem;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
    }

    .form-header {
        margin-bottom: 2rem;
        text-align: center;
    }

    .btn-back {
        background: none;
        border: none;
        color: #64748b;
        font-weight: 600;
        cursor: pointer;
        font-size: 0.9rem;
        margin-bottom: 1rem;
        transition: color 0.2s;
    }

    .btn-back:hover { color: #3b82f6; }

    h1 {
        font-size: 2rem;
        font-weight: 800;
        color: white;
        margin: 0 0 0.5rem 0;
    }

    .accent { color: #3b82f6; }

    .form-header p {
        color: #94a3b8;
        font-size: 0.95rem;
        line-height: 1.5;
    }

    /* Formulär-styling */
    .cyber-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .field-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    label {
        font-size: 0.85rem;
        font-weight: 700;
        color: #cbd5e1;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .optional {
        color: #64748b;
        text-transform: none;
        font-weight: 400;
    }

    .input-wrapper {
        position: relative;
        width: 100%;
    }

    input, textarea {
        width: 100%;
        padding: 0.8rem 1rem;
        background: rgba(7, 16, 39, 0.8);
        border: 1px solid #22303f;
        border-radius: 0.75rem;
        color: white;
        font-family: inherit;
        font-size: 1rem;
        transition: all 0.2s;
        box-sizing: border-box;
    }

    textarea { resize: vertical; }

    input:focus, textarea:focus {
        outline: none;
        border-color: #3b82f6;
        background: rgba(7, 16, 39, 1);
    }

    /* En snygg linje som "laddas" när man fokuserar */
    .focus-border {
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 0;
        height: 2px;
        background: #3b82f6;
        transition: all 0.3s ease;
        transform: translateX(-50%);
    }

    input:focus + .focus-border, 
    textarea:focus + .focus-border {
        width: 80%;
    }

    /* Knappar */
    .form-actions {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        margin-top: 1rem;
    }

    .btn-primary {
        position: relative;
        width: 100%;
        padding: 1rem;
        background: linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%);
        border: none;
        border-radius: 0.75rem;
        color: white;
        font-size: 1rem;
        font-weight: 700;
        cursor: pointer;
        overflow: hidden;
        transition: transform 0.2s;
    }

    .btn-primary:hover {
        transform: translateY(-2px);
    }

    .btn-primary:active {
        transform: translateY(0);
    }

    .btn-glow {
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
        );
        transition: 0.5s;
    }

    .btn-primary:hover .btn-glow {
        left: 100%;
    }

    .link-cancel {
        color: #64748b;
        text-decoration: none;
        font-size: 0.9rem;
        font-weight: 600;
        transition: color 0.2s;
    }

    .link-cancel:hover { color: #f1f5f9; }

    /* Responsivitet */
    @media (max-width: 480px) {
        .create-card {
            padding: 1.5rem;
            border-radius: 1rem;
        }
    }
</style>