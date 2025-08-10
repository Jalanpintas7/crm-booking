<script>
  import '../app.css';
  import Navigation from '$lib/components/Navigation.svelte';
</script>

<div class="app">
  <Navigation />
  <main>
    <slot />
  </main>
</div>

<style>
  .app {
    min-height: 100vh;
    min-height: 100dvh;
    background-color: #0f0f0f;
    color: #e5e5e5;
    display: flex;
    flex-direction: column;
  }

  main {
    width: 100%;
    max-width: none;
    margin: 0;
    padding: 0 0 2rem 0;
    flex: 1 1 auto;
    box-sizing: border-box;
  }
</style>
