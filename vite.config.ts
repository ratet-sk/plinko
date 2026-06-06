<script lang="ts">
  import logo from '$lib/assets/logo.svg';
  import Balance from '$lib/components/Balance.svelte';
  import CrashGame from '$lib/components/Crash/CrashGame.svelte';
  import LiveStatsWindow from '$lib/components/LiveStatsWindow/LiveStatsWindow.svelte';
  import MinesGame from '$lib/components/Mines/MinesGame.svelte';
  import Plinko from '$lib/components/Plinko';
  import SettingsWindow from '$lib/components/SettingsWindow';
  import Sidebar from '$lib/components/Sidebar';
  import { setBalanceFromLocalStorage, writeBalanceToLocalStorage } from '$lib/utils/game';
  import GitHubLogo from 'phosphor-svelte/lib/GithubLogo';
  import { twMerge } from 'tailwind-merge';

  type GameId = 'plinko' | 'crash' | 'mines';
  let activeGame = $state<GameId>('plinko');

  const games: { id: GameId; label: string }[] = [
    { id: 'plinko', label: 'Plinko' },
    { id: 'crash', label: 'Crash' },
    { id: 'mines', label: 'Mines' },
  ];

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

      <!-- Game card -->
      <div class="overflow-hidden rounded-xl lg:w-full">

        <!-- Game selector tabs -->
        <div class="flex gap-1 border-b border-c-border/50 bg-c-panel px-3 pt-3">
          {#each games as game}
            <button
              onclick={() => (activeGame = game.id)}
              class={twMerge(
                'rounded-t-lg px-5 py-2.5 text-sm font-semibold transition select-none',
                activeGame === game.id
                  ? 'bg-c-bg text-white'
                  : 'text-c-text-muted hover:text-white hover:bg-c-surface/50',
              )}
            >{game.label}</button>
          {/each}
        </div>

        <!-- Active game -->
        {#if activeGame === 'plinko'}
          <div class="flex flex-col-reverse lg:flex-row">
            <Sidebar />
            <div class="flex-1"><Plinko /></div>
          </div>
        {:else if activeGame === 'crash'}
          <CrashGame />
        {:else}
          <MinesGame />
        {/if}
      </div>
    </div>
  </div>

  <!-- Plinko-specific floating windows -->
  {#if activeGame === 'plinko'}
    <SettingsWindow />
    <LiveStatsWindow />
  {/if}

  <footer class="px-5 pt-16 pb-4">
    <div class="mx-auto max-w-[40rem]">
      <div aria-hidden="true" class="h-[1px] bg-c-border/50"></div>
      <div class="flex items-center justify-between p-2">
        <p class="text-sm text-c-text-muted">
          <a href="https://www.ansonh.com" target="_blank" rel="noreferrer"
            class="text-green-500 transition hover:text-green-400">Anson Heung</a>
          © {new Date().getFullYear()}
        </p>
        <a href="https://github.com/AnsonH/plinko-game" target="_blank" rel="noreferrer"
          class="flex items-center gap-1 p-1 text-sm text-c-text-muted transition hover:text-green-400">
          <GitHubLogo class="size-4" weight="bold" />
          <span>Source Code</span>
        </a>
      </div>
    </div>
  </footer>
</div>

<style lang="postcss">
  @reference "../app.css";
  :global(body) { background-color: var(--color-c-bg); }
</style>
