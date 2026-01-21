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

<div class="detail-container">
    <header class="detail-header">
        <div class="title-group">
            <a href="/characters" class="back-link">← Galleri</a>
            <h1>{data.character.name}</h1>
            {#if data.character.description}
                <p class="description">{data.character.description}</p>
            {/if}
        </div>
        <div class="header-actions">
            <a href="/characters/create" class="btn secondary">Skapa ny</a>
        </div>
    </header>

    <section class="stats-grid">
        <div class="stat-card main">
            <span class="label">Win Rate</span>
            <span class="value highlight">{data.winRate}%</span>
            <div class="progress-bar">
                <div class="progress-fill" style="width: {data.winRate}%"></div>
            </div>
        </div>
        <div class="stat-card">
            <span class="label">Matcher</span>
            <span class="value">{data.total}</span>
        </div>
        <div class="stat-card">
            <span class="label">Vinster</span>
            <span class="value win">{data.wins}</span>
        </div>
        <div class="stat-card">
            <span class="label">Streak</span>
            {#if streak.type}
                <span class="value streak-{streak.type}">{streak.length} {streak.type === 'win' ? 'W' : 'L'}</span>
            {:else}
                <span class="value">-</span>
            {/if}
        </div>
    </section>

    <div class="content-split">
        <section class="log-section glass-panel">
            <h2>Logga Match</h2>
            <p class="subtitle">Simulera en 50/50 match mot en motståndare.</p>

            <form method="POST" action="?/logMatch" class="cyber-form">
                <input type="hidden" name="characterId" value={data.character.id} />

                <div class="field">
                    <label for="opp">Motståndare</label>
                    <select id="opp" name="opponentId">
                        <option value="">Solo (Ingen motståndare)</option>
                        {#each data.otherCharacters as oc}
                            <option value={oc.id}>{oc.name}</option>
                        {/each}
                    </select>
                </div>

                <div class="form-row">
                    <div class="field">
                        <label for="dur">Tid (sek)</label>
                        <input id="dur" name="durationSeconds" type="number" placeholder="120" />
                    </div>
                    <div class="field">
                        <label for="comm">Kommentar</label>
                        <input id="comm" name="comment" placeholder="Kändes bra..." />
                    </div>
                </div>

                <button type="submit" class="btn primary full-width">Starta Simulering</button>
            </form>
        </section>

        <section class="history-section">
            <h2>Matchhistorik</h2>
            <div class="history-list">
                {#each data.character.games as g}
                    <div class="game-item {g.result.toLowerCase()}">
                        <div class="status-indicator"></div>
                        <div class="game-info">
                            <div class="game-main">
                                <span class="result-text">{g.result}</span>
                                {#if g.opponentName}
                                    <span class="vs">vs {g.opponentName}</span>
                                {/if}
                            </div>
                            <div class="game-meta">
                                <span>{new Date(g.createdAt).toLocaleDateString()}</span>
                                {#if g.durationSeconds}<span>• {g.durationSeconds}s</span>{/if}
                            </div>
                            {#if g.comment}
                                <p class="game-comment">"{g.comment}"</p>
                            {/if}
                        </div>
                    </div>
                {/each}

                {#if data.character.games.length === 0}
                    <div class="empty-state">Inga spelade matcher än.</div>
                {/if}
            </div>
        </section>
    </div>
</div>

<style>
    .detail-container {
        max-width: 1000px;
        margin: 2rem auto;
        padding: 0 1rem 5rem;
    }

    /* Header */
    .detail-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 2.5rem;
    }

    .back-link {
        color: #3b82f6;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.9rem;
        display: block;
        margin-bottom: 0.5rem;
    }

    h1 { font-size: 2.5rem; font-weight: 900; margin: 0; color: white; }
    .description { color: #94a3b8; margin: 0.5rem 0 0; font-size: 1.1rem; }

    /* Stats Grid */
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1rem;
        margin-bottom: 3rem;
    }

    .stat-card {
        background: rgba(30, 41, 59, 0.5);
        padding: 1.5rem;
        border-radius: 1rem;
        border: 1px solid rgba(255, 255, 255, 0.05);
        display: flex;
        flex-direction: column;
    }

    .stat-card.main { background: rgba(59, 130, 246, 0.1); border-color: rgba(59, 130, 246, 0.2); }
    .stat-card .label { font-size: 0.75rem; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 1px; }
    .stat-card .value { font-size: 1.8rem; font-weight: 800; margin-top: 0.25rem; }
    
    .value.highlight { color: #60a5fa; }
    .value.win { color: #10b981; }
    .streak-win { color: #facc15; }
    .streak-loss { color: #ef4444; }

    .progress-bar { height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-top: 1rem; overflow: hidden; }
    .progress-fill { height: 100%; background: #3b82f6; border-radius: 2px; }

    /* Layout Split */
    .content-split {
        display: grid;
        grid-template-columns: 350px 1fr;
        gap: 2.5rem;
        align-items: start;
    }

    .glass-panel {
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(12px);
        padding: 2rem;
        border-radius: 1.5rem;
        border: 1px solid rgba(255, 255, 255, 0.05);
    }

    h2 { font-size: 1.5rem; margin: 0 0 0.5rem 0; color: white; }
    .subtitle { color: #64748b; font-size: 0.9rem; margin-bottom: 1.5rem; }

    /* Form */
    .cyber-form { display: flex; flex-direction: column; gap: 1.25rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    
    .field label { display: block; font-size: 0.75rem; font-weight: 700; color: #94a3b8; margin-bottom: 0.5rem; text-transform: uppercase; }
    
    input, select {
        width: 100%;
        padding: 0.75rem;
        background: #071027;
        border: 1px solid #1e293b;
        border-radius: 0.5rem;
        color: white;
        box-sizing: border-box;
    }

    /* Historik-lista */
    .history-list { display: flex; flex-direction: column; gap: 0.75rem; }

    .game-item {
        background: rgba(30, 41, 59, 0.3);
        border: 1px solid rgba(255,255,255,0.03);
        border-radius: 0.75rem;
        padding: 1rem;
        display: flex;
        gap: 1rem;
        align-items: center;
        transition: transform 0.2s;
    }

    .game-item:hover { transform: translateX(5px); background: rgba(30, 41, 59, 0.5); }

    .status-indicator { width: 4px; height: 40px; border-radius: 2px; flex-shrink: 0; }
    .game-item.win .status-indicator { background: #10b981; box-shadow: 0 0 10px rgba(16, 185, 129, 0.4); }
    .game-item.loss .status-indicator { background: #ef4444; }
    .game-item.draw .status-indicator { background: #facc15; }

    .game-main { display: flex; gap: 0.75rem; align-items: center; }
    .result-text { font-weight: 800; font-size: 1rem; text-transform: uppercase; }
    .vs { color: #94a3b8; font-size: 0.9rem; }
    .game-meta { font-size: 0.8rem; color: #64748b; margin-top: 0.25rem; }
    .game-comment { font-style: italic; font-size: 0.85rem; color: #cbd5e1; margin: 0.5rem 0 0 0; }

    /* Knappar */
    .btn {
        padding: 0.75rem 1.25rem;
        border-radius: 0.75rem;
        font-weight: 700;
        cursor: pointer;
        text-decoration: none;
        display: inline-block;
        border: none;
    }
    .btn.primary { background: #3b82f6; color: white; }
    .btn.secondary { background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); }
    .full-width { width: 100%; }

    @media (max-width: 850px) {
        .content-split { grid-template-columns: 1fr; }
        .detail-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
    }
</style>