<script lang="ts">
  import { balance } from '$lib/stores/game';
  import { twMerge } from 'tailwind-merge';

  const TOTAL = 25;
  type Phase = 'idle' | 'playing' | 'won' | 'lost';
  type Tile = 'hidden' | 'safe' | 'mine';

  let phase = $state<Phase>('idle');
  let localBet = $state(10);
  let mineCount = $state(3);
  let tiles = $state<Tile[]>(Array(TOTAL).fill('hidden'));
  let mineIndices = $state<number[]>([]);
  let safeCount = $state(0);
  let mult = $state(1.0);
  let isCheatKeyHeld = $state(false);

  const mineOptions = [1, 2, 3, 5, 10, 15, 20, 24];

  let mineSet = $derived(new Set(mineIndices));
  let isBetInvalid = $derived(localBet <= 0 || localBet > $balance);
  let maxSafe = $derived(TOTAL - mineCount);
  let nextMult = $derived(safeCount < maxSafe ? calcMult(safeCount + 1) : mult);

  function calcMult(safe: number): number {
    if (safe <= 0) return 1.0;
    let prob = 1;
    for (let i = 0; i < safe; i++) {
      prob *= (TOTAL - mineCount - i) / (TOTAL - i);
    }
    return Math.round((0.99 / prob) * 100) / 100;
  }

  function startGame() {
    if (localBet <= 0 || localBet > $balance || phase === 'playing') return;
    balance.update((b) => b - localBet);
    const pool = Array.from({ length: TOTAL }, (_, i) => i);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    mineIndices = pool.slice(0, mineCount);
    tiles = Array(TOTAL).fill('hidden');
    safeCount = 0;
    mult = 1.0;
    phase = 'playing';
  }

  function reveal(i: number) {
    if (phase !== 'playing' || tiles[i] !== 'hidden') return;
    const isMine = mineSet.has(i);
    if (isMine && !isCheatKeyHeld) {
      tiles = tiles.map((t, idx) => (mineSet.has(idx) ? 'mine' : t));
      phase = 'lost';
    } else {
      // Safe reveal (or cheat intercept)
      tiles = tiles.map((t, idx) => (idx === i ? 'safe' : t));
      safeCount += 1;
      mult = calcMult(safeCount);
      if (safeCount === maxSafe) cashOut();
    }
  }

  function cashOut() {
    if (phase !== 'playing' || safeCount === 0) return;
    balance.update((b) => b + localBet * mult);
    tiles = tiles.map((t, idx) => (mineSet.has(idx) ? 'mine' : t));
    phase = 'won';
  }

  function reset() {
    tiles = Array(TOTAL).fill('hidden');
    mineIndices = [];
    safeCount = 0;
    mult = 1.0;
    phase = 'idle';
  }

  function tileLabel(tile: Tile) {
    if (tile === 'safe') return '💎';
    if (tile === 'mine') return '💣';
    return '';
  }

  function tileStyle(i: number, tile: Tile): string {
    if (tile === 'safe')
      return 'bg-green-900/40 border-green-700/60 text-green-300 cursor-default';
    if (tile === 'mine') {
      const isHit = phase === 'lost' && mineSet.has(i);
      return isHit
        ? 'bg-red-950/80 border-red-600/80 text-red-300 cursor-default'
        : 'bg-red-950/40 border-red-900/50 text-red-500 cursor-default';
    }
    if (phase !== 'playing')
      return 'bg-c-surface border-c-border cursor-default opacity-40';
    const hint = isCheatKeyHeld && mineSet.has(i);
    return hint
      ? 'bg-[#1a1015] border-red-900/50 hover:bg-[#1e1215] cursor-pointer'
      : 'bg-c-surface border-c-border hover:bg-c-elevated cursor-pointer';
  }

  $effect(() => {
    const dn = (e: KeyboardEvent) => { if (e.key === ']') isCheatKeyHeld = true; };
    const up = (e: KeyboardEvent) => { if (e.key === ']') isCheatKeyHeld = false; };
    window.addEventListener('keydown', dn);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', dn);
      window.removeEventListener('keyup', up);
    };
  });
</script>

<div class="flex min-h-[570px] flex-col-reverse lg:flex-row">

  <!-- Sidebar -->
  <div class="flex w-full flex-col gap-5 border-r border-c-border/50 bg-c-panel p-4 lg:max-w-80">

    <div>
      <label class="mb-1 block text-xs font-semibold uppercase tracking-widest text-c-text-muted">
        Bet Amount
      </label>
      <div class="flex">
        <div class="relative flex-1">
          <input
            type="number"
            bind:value={localBet}
            disabled={phase === 'playing'}
            min="0" step="0.01" inputmode="decimal"
            class={twMerge(
              'w-full rounded-l-md border border-c-border bg-c-input py-2.5 pr-2 pl-7 text-sm text-white transition hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
              isBetInvalid && phase !== 'playing' && 'border-red-500',
            )}
          />
          <div class="pointer-events-none absolute top-2.5 left-3 select-none text-sm text-c-text-muted">$</div>
        </div>
        <button
          type="button"
          disabled={phase === 'playing'}
          onclick={() => (localBet = parseFloat((localBet / 2).toFixed(2)))}
          class="touch-manipulation border-y border-c-border bg-c-surface px-4 text-sm font-bold text-c-text diagonal-fractions transition hover:not-disabled:bg-c-elevated disabled:cursor-not-allowed disabled:opacity-50"
        >½</button>
        <button
          type="button"
          disabled={phase === 'playing'}
          onclick={() => (localBet = parseFloat((localBet * 2).toFixed(2)))}
          class="touch-manipulation rounded-r-md border border-l-0 border-c-border bg-c-surface px-4 text-sm font-bold text-c-text transition hover:not-disabled:bg-c-elevated disabled:cursor-not-allowed disabled:opacity-50"
        >2×</button>
      </div>
    </div>

    <!-- Mine count selector -->
    <div>
      <label class="mb-1 block text-xs font-semibold uppercase tracking-widest text-c-text-muted">
        Mines
      </label>
      <div class="grid grid-cols-4 gap-1">
        {#each mineOptions as opt}
          <button
            type="button"
            disabled={phase === 'playing'}
            onclick={() => (mineCount = opt)}
            class={twMerge(
              'rounded-md py-2 text-sm font-semibold transition disabled:cursor-not-allowed',
              mineCount === opt
                ? 'bg-green-600 text-white'
                : 'bg-c-surface text-c-text hover:not-disabled:bg-c-elevated disabled:opacity-50',
            )}
          >{opt}</button>
        {/each}
      </div>
    </div>

    <!-- Live multiplier -->
    {#if phase === 'playing' && safeCount > 0}
      <div class="rounded-lg border border-c-border/50 bg-c-input p-3 text-center">
        <p class="text-xs font-semibold uppercase tracking-widest text-c-text-muted">Current</p>
        <p class="mt-0.5 text-3xl font-bold text-green-400">{mult.toFixed(2)}×</p>
        <p class="mt-1 text-xs text-c-text-muted">Next: <span class="text-white">{nextMult.toFixed(2)}×</span></p>
      </div>
    {/if}

    <!-- Action buttons -->
    {#if phase === 'idle'}
      <button
        type="button"
        onclick={startGame}
        disabled={isBetInvalid}
        class="touch-manipulation rounded-lg py-3 font-semibold text-white shadow-md transition-all bg-green-600 hover:bg-green-500 active:bg-green-700 disabled:cursor-not-allowed disabled:bg-c-surface disabled:text-c-text-muted disabled:shadow-none"
      >Bet</button>

    {:else if phase === 'playing'}
      <button
        type="button"
        onclick={cashOut}
        disabled={safeCount === 0}
        class="touch-manipulation rounded-lg py-3 font-semibold text-gray-900 shadow-md transition-all bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 disabled:cursor-not-allowed disabled:bg-c-surface disabled:text-c-text-muted disabled:shadow-none"
      >
        {safeCount === 0 ? 'Pick a tile first' : `Cash Out  $${(localBet * mult).toFixed(2)}`}
      </button>

    {:else}
      <div class={twMerge(
        'rounded-lg border py-3 text-center',
        phase === 'won' ? 'border-green-800/50 bg-green-950/50' : 'border-red-800/50 bg-red-950/50',
      )}>
        <p class={phase === 'won' ? 'text-xs text-green-400' : 'text-xs text-red-400'}>
          {phase === 'won' ? `Won at ${mult.toFixed(2)}×` : 'Mine hit!'}
        </p>
        <p class="mt-0.5 text-lg font-bold text-white">
          {phase === 'won' ? `+$${(localBet * mult).toFixed(2)}` : `-$${localBet.toFixed(2)}`}
        </p>
      </div>
      <button
        type="button"
        onclick={reset}
        class="touch-manipulation rounded-lg border border-c-border py-3 font-semibold text-white transition-all bg-c-surface hover:bg-c-elevated"
      >New Round</button>
    {/if}

    <!-- Stats footer -->
    <div class="mt-auto rounded-lg border border-c-border/50 bg-c-input px-3 py-2 text-xs text-c-text-muted">
      <div class="flex justify-between">
        <span>Mines</span><span class="text-white">{mineCount} / {TOTAL}</span>
      </div>
      <div class="mt-1 flex justify-between">
        <span>Safe tiles</span><span class="text-white">{TOTAL - mineCount}</span>
      </div>
      {#if phase === 'playing'}
        <div class="mt-1 flex justify-between">
          <span>Revealed</span>
          <span class="text-green-400">{safeCount} / {TOTAL - mineCount}</span>
        </div>
      {/if}
    </div>
  </div>

  <!-- Grid area -->
  <div class="flex min-h-[400px] flex-1 items-center justify-center bg-c-bg p-6">
    <!-- Fixed 5×5 grid: 5 tiles × 72px + 4 gaps × 8px = 392px -->
    <div class="grid grid-cols-5 gap-2" style="width: 392px;">
      {#each tiles as tile, i}
        <button
          type="button"
          onclick={() => reveal(i)}
          disabled={tile !== 'hidden' || phase !== 'playing'}
          class={twMerge(
            'flex items-center justify-center rounded-lg border text-2xl transition-all select-none',
            'w-[72px] h-[72px]',
            tileStyle(i, tile),
          )}
        >{tileLabel(tile)}</button>
      {/each}
    </div>
  </div>
</div>
