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

    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.4; }
        100% { opacity: 1; }
    }
</style>