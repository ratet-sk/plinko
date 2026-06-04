<script lang="ts">
  import logo from '$lib/assets/logo.svg';
  import Balance from '$lib/components/Balance.svelte';
  import LiveStatsWindow from '$lib/components/LiveStatsWindow/LiveStatsWindow.svelte';
  import Plinko from '$lib/components/Plinko';
  import SettingsWindow from '$lib/components/SettingsWindow';
  import Sidebar from '$lib/components/Sidebar';
  import { setBalanceFromLocalStorage, writeBalanceToLocalStorage } from '$lib/utils/game';
  import GitHubLogo from 'phosphor-svelte/lib/GithubLogo';

  $effect(() => {
    setBalanceFromLocalStorage();
  });
</script>

<svelte:window onbeforeunload={writeBalanceToLocalStorage} />

<div class="relative flex min-h-dvh w-full flex-col">
  <nav class="sticky top-0 z-10 w-full bg-c-nav border-b border-c-border/50 drop-shadow-lg">
    <div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-5">
      <img src={logo} alt="logo" class="h-6 sm:h-7" />
      <div class="mx-auto">
        <Balance />
      </div>
    </div>
  </nav>

  <div class="flex-1 px-5">
    <div class="mx-auto mt-5 max-w-xl min-w-[300px] drop-shadow-xl md:mt-10 lg:max-w-7xl">
      <div class="flex flex-col-reverse overflow-hidden rounded-xl lg:w-full lg:flex-row">
        <Sidebar />
        <div class="flex-1">
          <Plinko />
        </div>
      </div>
    </div>
  </div>

  <SettingsWindow />
  <LiveStatsWindow />

  <footer class="px-5 pt-16 pb-4">
    <div class="mx-auto max-w-[40rem]">
      <div aria-hidden="true" class="h-[1px] bg-c-border/50"></div>
      <div class="flex items-center justify-between p-2">
        <p class="text-sm text-c-text-muted">
          <a
            href="https://www.ansonh.com"
            target="_blank"
            rel="noreferrer"
            class="text-green-500 transition hover:text-green-400"
          >
            Anson Heung
          </a>
          © {new Date().getFullYear()}
        </p>
        <a
          href="https://github.com/AnsonH/plinko-game"
          target="_blank"
          rel="noreferrer"
          class="flex items-center gap-1 p-1 text-sm text-c-text-muted transition hover:text-green-400"
        >
          <GitHubLogo class="size-4" weight="bold" />
          <span>Source Code</span>
        </a>
      </div>
    </div>
  </footer>
</div>

<style lang="postcss">
  @reference "../app.css";

  :global(body) {
    background-color: var(--color-c-bg);
  }
</style>
