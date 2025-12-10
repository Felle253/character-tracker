<!-- src/routes/profile/+page.svelte -->
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
			} else {
				profileUser = null;
				profileImages = [];
			}
		} catch (err) {
			console.error('fetchProfile error', err);
			profileUser = null;
			profileImages = [];
		}
	}

	onMount(() => {
		fetchProfile();
		// sync across tabs
		const onStorage = (e: StorageEvent) => {
			if (e.key === 'app_auth') fetchProfile();
		};
		window.addEventListener('storage', onStorage);
		return () => window.removeEventListener('storage', onStorage);
	});

	function handleFile(e: Event) {
		const input = e.target as HTMLInputElement;
		const f = input.files?.[0];
		if (f) {
			previewUrl = URL.createObjectURL(f);
		} else {
			previewUrl = '';
		}
	}

	function goBack() {
		goto('/characters');
	}

	// We set uploading true just before native submission so the button disables immediately.
	function onSubmitStart() {
		uploading = true;
	}

	async function removeImage(id: string) {
		if (!confirm('Ta bort denna bild?')) return;

		// Use fetch to call the named action (works too), but we also support a plain form remove button below.
		const form = new FormData();
		form.set('imageId', id);

		try {
			const res = await fetch('?/remove', { method: 'POST', body: form });
			if (res.ok) {
				await fetchProfile();
			} else {
				const body = await res.json().catch(() => ({}));
				alert(body.error ?? 'Kunde inte ta bort bilden');
			}
		} catch (err) {
			console.error('removeImage error', err);
			alert('Nätverksfel vid radering');
		}
	}
</script>

<section class="profile-page">
	<header class="profile-header">
		<h1>Min profil</h1>
		<div class="header-actions">
			<button class="btn ghost" on:click={goBack}>Tillbaka</button>
		</div>
	</header>

	{#if !user}
		<div class="not-logged">
			<p>Du måste vara inloggad. <a href="/login" class="link">Logga in</a></p>
		</div>
	{:else}
		<div class="profile-grid">
			<div class="profile-card">
				<div class="avatar-wrap">
					{#if profileUser?.profileImage}
						<img class="avatar-img" src={profileUser.profileImage} alt="Profilbild" />
					{:else}
						<div class="avatar-fallback">{user.username?.slice(0, 1).toUpperCase()}</div>
					{/if}
				</div>

				<div class="user-info">
					<div class="username">{user.username}</div>
					<div class="email">{user.email}</div>
				</div>
			</div>

			<!-- upload form: method=POST, enctype correct.
                 Note: the button uses formaction="?/upload" to invoke the named action 'upload' -->
			<form method="POST" enctype="multipart/form-data" class="upload-form" on:submit={onSubmitStart}>
				<input type="hidden" name="userId" value={user.id} />
				<label class="file-label">
					<input type="file" name="image" accept="image/png,image/jpeg,image/webp" on:change={handleFile} />
				</label>

				{#if previewUrl}
					<div class="preview"><img src={previewUrl} alt="preview" /></div>
				{/if}

				<div class="actions">
					<!-- named action invoked here -->
					<button class="btn primary" type="submit" formaction="?/upload" disabled={uploading}>
						{uploading ? 'Laddar upp...' : 'Ladda upp profilbild'}
					</button>
				</div>

				<p class="hint">Max 10 MB. Tillåtna typer: JPG, PNG, WEBP.</p>
			</form>
		</div>

		<h2>Bildgalleri</h2>
		<div class="gallery">
			{#if profileImages.length === 0}
				<div class="empty">Ingen bildhistorik än.</div>
			{/if}

			{#each profileImages as img}
				<div class="gallery-item">
					<img src={img.imageUrl} alt="profilbild" />
					<!-- small form per image that triggers named action 'remove' via formaction -->
					<form method="POST" style="display:inline">
						<input type="hidden" name="imageId" value={img.id} />
						<button type="submit" class="btn ghost" formaction="?/remove">Ta bort</button>
					</form>
				</div>
			{/each}
		</div>
	{/if}
</section>

<style>
	:global(body) { background: radial-gradient(1200px 600px at 10% 10%, #061226, #071027); }
	.profile-page { max-width: 48rem; margin: 2rem auto; padding: 1.25rem; background: #0f172a; color: #f8fafc; border-radius: 0.75rem; border: 1px solid #233240; }
	.profile-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; }
	.profile-grid { display:grid; grid-template-columns:180px 1fr; gap:1rem; align-items:start; }
	.profile-card { padding:1rem; background:#071027; border-radius:0.75rem; border:1px solid #22303f; display:flex; flex-direction:column; align-items:center; gap:0.75rem; }
	.avatar-img{width:120px;height:120px;border-radius:999px;object-fit:cover;border:2px solid #0ea5a9;}
	.avatar-fallback{width:120px;height:120px;border-radius:999px;background:#0ea5a9;color:#021124;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:2rem;}
	.upload-form{display:flex;flex-direction:column;gap:0.75rem;background:#071027;padding:1rem;border-radius:0.75rem;border:1px solid #22303f;}
	.file-label input[type='file']{width:100%;padding:0.5rem;background:#0f172a;color:#f8fafc;border-radius:0.5rem;border:1px solid #22303f;}
	.preview img{max-width:360px;border-radius:0.5rem;border:1px solid #22303f;}
	.actions{display:flex;gap:0.5rem;align-items:center;}
	.btn{padding:0.6rem 0.9rem;border-radius:0.5rem;font-weight:700;border:none;cursor:pointer;}
	.btn.primary{background:linear-gradient(90deg,#2563eb,#7c3aed);color:#fff;}
	.btn.ghost{background:transparent;border:1px solid rgba(255,255,255,0.06);color:#e6eef8;}
	.hint{font-size:0.85rem;color:#94a3b8;margin-top:0.25rem;}
	.gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:1rem;margin-top:1rem;}
	.gallery-item{position:relative;}
	.gallery-item img{width:100%;border-radius:0.5rem;border:1px solid #22303f;display:block;}
	.gallery-item button{position:absolute;top:0.25rem;right:0.25rem;font-size:0.75rem;padding:0.25rem 0.5rem;}
	.empty{color:#94a3b8;padding:1rem;grid-column:1/-1;}
</style>
