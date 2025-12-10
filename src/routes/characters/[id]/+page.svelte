<script lang="ts">
	export let data;

	function computeStreak(games) {
		let i = 0;
		if (!games || games.length === 0) return { type: null, length: 0 };
		const firstIsWin = games[0].result === 'WIN';
		for (const g of games) {
			if ((g.result === 'WIN') === firstIsWin) i++;
			else break;
		}
		return { type: firstIsWin ? 'win' : 'loss', length: i };
	}
	const streak = computeStreak(data.character.games);
</script>

<section class="detail">
	<header class="detail-top">
		<div>
			<h1>{data.character.name}</h1>
			{#if data.character.description}<p class="desc">{data.character.description}</p>{/if}
			<div class="meta">
				<span>Matches: {data.total}</span>
				<span>Wins: {data.wins}</span>
				<span>Losses: {data.losses}</span>
				<span>Draws: {data.draws}</span>
				<span>Win rate: <strong>{data.winRate}%</strong></span>
				{#if streak.type}
					<span class="streak"
						>Streak: {streak.length} {streak.type === 'win' ? 'wins' : 'losses'}</span
					>
				{/if}
			</div>
		</div>

		<div class="actions">
			<a href="/characters" class="btn">Tillbaka</a>
			<a href="/characters/create" class="btn">Skapa ny</a>
		</div>
	</header>

	<section class="log-match">
		<h2>Simulera match (50/50 win / loss)</h2>

		<!-- form posts to server which randomises result server-side -->
		<form method="POST" action="?/logMatch" class="log-form">
			<input type="hidden" name="characterId" value={data.character.id} />

			<div class="field">
				<label>Motståndare</label>
				<select name="opponentId">
					<option value="">Ingen motståndare (spara endast för denna character)</option>
					{#each data.otherCharacters as oc}
						<option value={oc.id}>{oc.name}</option>
					{/each}
				</select>
			</div>

			<div class="field">
				<label>Kommentar (valfritt)</label>
				<input name="comment" placeholder="tough game, felt lucky..." />
			</div>

			<div class="field">
				<label>Speltid (valfritt)</label>
				<input name="durationSeconds" type="number" min="0" placeholder="120" />
			</div>

			<div class="actions">
				<button type="submit" class="btn primary">Spela match (simulera 50/50)</button>
			</div>
		</form>
	</section>

	<section class="history">
		<h2>Match-historik</h2>
		<ul>
			{#each data.character.games as g}
				<li class={`game ${g.result === 'WIN' ? 'win' : g.result === 'LOSS' ? 'loss' : 'draw'}`}>
					<div class="left">
						<div class="result">
							{#if g.result === 'WIN'}
								Win
							{:else if g.result === 'LOSS'}
								Loss
							{:else}
								Draw
							{/if}
						</div>
						<div class="time">{new Date(g.createdAt).toLocaleString()}</div>
						{#if g.opponentName}<div class="opp">vs {g.opponentName}</div>{/if}
						{#if g.durationSeconds}<div class="dur">{g.durationSeconds}s</div>{/if}
						{#if g.comment}<div class="comment">"{g.comment}"</div>{/if}
					</div>
				</li>
			{/each}
			{#if data.character.games.length === 0}
				<li class="empty">Inga matcher ännu.</li>
			{/if}
		</ul>
	</section>
</section>

<style>
	.detail {
		max-width: 64rem;
		margin: 2rem auto;
		padding: 1.25rem;
		background: #0f172a;
		color: #f8fafc;
		border-radius: 0.75rem;
		border: 1px solid #22303f;
	}
	.detail-top {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		align-items: flex-start;
		margin-bottom: 1.25rem;
	}
	h1 {
		color: #60a5fa;
		margin: 0 0 0.4rem 0;
		font-size: 1.5rem;
	}
	.desc {
		color: #94a3b8;
		margin: 0 0 0.5rem 0;
	}
	.meta {
		display: flex;
		gap: 0.75rem;
		color: #cbd5e1;
		flex-wrap: wrap;
		margin-top: 0.5rem;
	}
	.streak {
		color: #facc15;
		font-weight: 700;
	}

	.actions .btn {
		margin-left: 0.5rem;
		text-decoration: none;
		padding: 0.4rem 0.6rem;
		border-radius: 0.4rem;
		background: #071027;
		color: #f8fafc;
		border: 1px solid #334155;
	}

	.log-match {
		margin-top: 0.75rem;
		margin-bottom: 1rem;
	}
	.log-form {
		display: grid;
		gap: 0.75rem;
		grid-template-columns: 1fr;
	}
	.field label {
		display: block;
		color: #cbd5e1;
		margin-bottom: 0.25rem;
	}
	.field input,
	.field select {
		padding: 0.6rem;
		border-radius: 0.4rem;
		background: #071027;
		border: 1px solid #22303f;
		color: #f8fafc;
	}

	.btn.primary {
		background: #2563eb;
		color: white;
		padding: 0.5rem 0.75rem;
		border-radius: 0.4rem;
	}

	.history ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.game {
		display: flex;
		align-items: center;
		padding: 0.75rem;
		border-radius: 0.5rem;
		margin-bottom: 0.5rem;
		border: 1px solid #22303f;
		background: #071027;
	}
	.game.win {
		border-left: 4px solid #22c55e;
	}
	.game.loss {
		border-left: 4px solid #ef4444;
	}
	.game.draw {
		border-left: 4px solid #facc15;
	}
	.game .left .result {
		font-weight: 700;
		color: #f8fafc;
	}
	.game .left .time {
		font-size: 0.85rem;
		color: #94a3b8;
	}
	.game .opp,
	.game .dur,
	.game .comment {
		font-size: 0.9rem;
		color: #cbd5e1;
		margin-top: 0.25rem;
	}
	.empty {
		color: #94a3b8;
		padding: 0.75rem;
	}
</style>
