<!-- src/routes/characters/create/+page.svelte -->
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
      // not logged in -> back to login
      goto('/login');
      return;
    }
    auth = JSON.parse(raw);
    sessionId = auth.sessionId;
    user = auth.user;
  });
</script>

<section class="form-container">
  <h1>Skapa Character</h1>

  <form method="POST" class="form">
    <input type="hidden" name="sessionId" value={sessionId} />
    <div class="field">
      <label>Namn</label>
      <input name="name" bind:value={name} required />
    </div>

    <div class="field">
      <label>Beskrivning (valfritt)</label>
      <textarea name="description" bind:value={description}></textarea>
    </div>

    <div class="actions">
      <button type="submit" class="btn primary">Skapa</button>
      <a href="/characters" class="link">Avbryt</a>
    </div>
  </form>
</section>

<style>
	.form-container {
		max-width: 36rem;
		margin: 2rem auto;
		padding: 1.25rem;
		background: #0f172a;
		color: #f8fafc;
		border-radius: 0.5rem;
		border: 1px solid #233240;
	}
	h1 {
		color: #60a5fa;
		margin-bottom: 1rem;
	}
	.field {
		margin-bottom: 0.75rem;
	}
	label {
		display: block;
		font-size: 0.9rem;
		color: #cbd5e1;
		margin-bottom: 0.25rem;
	}
	input,
	textarea {
		width: 100%;
		padding: 0.6rem;
		border-radius: 0.4rem;
		background: #071027;
		border: 1px solid #22303f;
		color: #f8fafc;
	}
	.actions {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		margin-top: 0.5rem;
	}
	.btn.primary {
		background: #2563eb;
		color: white;
		padding: 0.5rem 0.75rem;
		border-radius: 0.4rem;
	}
	.link {
		color: #94a3b8;
		text-decoration: none;
	}
</style>
