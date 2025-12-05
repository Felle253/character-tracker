<!-- src/routes/register/+page.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';
  let username = '';
  let password = '';
  let email = '';

  async function submit(e: Event) {
    e.preventDefault();
    const form = new FormData();
    form.set('username', username);
    form.set('password', password);
    form.set('email', email);

    const res = await fetch('/register', { method: 'POST', body: form });
    const body = await res.json();
    if (!res.ok) {
      alert(body.error ?? 'Register failed');
      return;
    }

    // save to localStorage
    localStorage.setItem('app_auth', JSON.stringify({ user: body.user, sessionId: body.sessionId }));
    // redirect to characters
    goto('/characters');
  }
</script>

<section class="auth-card">
  <h1>Registrera</h1>
  <form on:submit|preventDefault={submit} class="auth-form">
    <label>Username <input bind:value={username} required /></label>
    <label>Password <input type="password" bind:value={password} required /></label>
    <label>Email (valfritt) <input bind:value={email} /></label>
    <div class="actions">
      <button type="submit" class="btn primary">Registrera</button>
      <a href="/login" class="link">Har redan konto?</a>
    </div>
  </form>
</section>

<style>
/* lightly styled to match your previous theme */
.auth-card { max-width:28rem; margin:3rem auto; padding:1.25rem; background:#0f172a; color:#f8fafc; border-radius:0.5rem; border:1px solid #22303f; }
.auth-form label { display:block; margin-bottom:0.75rem; color:#cbd5e1; }
.auth-form input { width:100%; padding:0.5rem; border-radius:0.4rem; background:#071027; color:#f8fafc; border:1px solid #22303f; }
.actions { display:flex; gap:0.75rem; align-items:center; margin-top:0.5rem; }
.btn.primary { background:#2563eb; color:white; padding:0.5rem 0.75rem; border-radius:0.4rem; }
.link { color:#94a3b8; text-decoration:none; }
</style>
