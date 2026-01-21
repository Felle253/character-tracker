<script lang="ts">
    import type { LayoutProps } from './$types';

    let { data, children }: LayoutProps = $props();
</script>

<div class="app-wrapper">
    <main class="content-area">
        {@render children()}
    </main>

    <footer class="glass-footer">
        <div class="footer-content">
            <p>© 2024 <span class="brand-text">My Application</span>. All rights reserved.</p>
            <div class="footer-links">
                <span class="status-indicator"></span> System Status: Online
            </div>
        </div>
    </footer>
</div>

<style>
    /* Grundinställningar för hela appen */
    .app-wrapper {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        /* Ser till att footern hamnar längst ner om sidan är kort */
    }

    .content-area {
        flex: 1; /* Tar upp allt tillgängligt utrymme */
    }

    /* Glassmorphism Footer */
    .glass-footer {
        width: 100%;
        padding: 1.5rem 0;
        background: rgba(15, 23, 42, 0.8); /* Mörk transparent blå/grå */
        backdrop-filter: blur(10px); /* Suddighetseffekt */
        -webkit-backdrop-filter: blur(10px);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        color: #94a3b8;
        font-size: 0.85rem;
    }

    .footer-content {
        max-width: 900px;
        margin: 0 auto;
        padding: 0 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .brand-text {
        color: #60a5fa; /* Blå accentfärg */
        font-weight: 700;
    }

    .footer-links {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    /* En liten detalj: en "pulserande" status-lampa */
    .status-indicator {
        width: 8px;
        height: 8px;
        background-color: #10b981; /* Grön */
        border-radius: 50%;
        display: inline-block;
        box-shadow: 0 0 8px #10b981;
        animation: pulse 2s infinite;
    }

    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.4; }
        100% { opacity: 1; }
    }

    @media (max-width: 600px) {
        .footer-content {
            flex-direction: column;
            text-align: center;
        }
    }
</style>