<script lang="ts">
    import type { LayoutProps } from './$types';

    let { data, children }: LayoutProps = $props();
</script>

<div class="app-wrapper">
    <main class="content-area">
        {@render children()}
    </main>
</div>

<style>
    .app-wrapper {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }

    .content-area {
        flex: 1;
    }

    .glass-footer {
        width: 100%;
        padding: 1.5rem 0;
        background: rgba(15, 23, 42, 0.8);
        backdrop-filter: blur(10px);
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
        color: #60a5fa;
        font-weight: 700;
    }

    .footer-links {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .status-indicator {
        width: 8px;
        height: 8px;
        background-color: #10b981;
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