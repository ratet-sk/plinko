<script lang="ts">
  import { balance } from '$lib/stores/game';
  import { twMerge } from 'tailwind-merge';

  type Phase = 'idle' | 'running' | 'cashed_out' | 'crashed';

  let phase = $state<Phase>('idle');
  let localBet = $state(10);
  let multiplier = $state(1.0);
  let crashPoint = $state(1.0);
  let cashedOutAt = $state(0);
  let isCheatKeyHeld = $state(false);

  // Chart history — sampled at ~20fps to keep SVG snappy
  let history = $state<{ t: number; m: number }[]>([]);

  let lastFrameTime = 0;
  let gameTime = 0; // accumulated "game time" — runs slower when ] is held
  let animFrameId: number | null = null;
  let lastSample = 0;
  let resetTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Crash point ───────────────────────────────────────────────────────────
  // ] held at bet time → guaranteed high crash point
  function generateCrashPoint(): number {
    if (isCheatKeyHeld) return 9 + Math.random() * 16; // 9–25×
    const r = Math.random();
    // 6% instant bust at 1×
    if (r < 0.06) return 1.0;
    // Skew heavily toward low multipliers using r^(5/3):
    // P(crash < 1.5×) ≈ 55%  |  P(crash < 2×) ≈ 72%  |  P(crash < 4×) ≈ 88%
    const skewed = Math.pow(r, 1.67);
    return Math.max(1.01, Math.min(20, 0.96 / skewed));
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  function placeBet() {
    if (isBetInvalid || phase !== 'idle') return;
    balance.update((b) => b - localBet);
    crashPoint = generateCrashPoint();
    history = [{ t: 0, m: 1 }];
    gameTime = 0;
    lastFrameTime = 0;
    lastSample = 0;
    phase = 'running';
    animFrameId = requestAnimationFrame(tick);
  }

  function cashOut() {
    if (phase !== 'running') return;
    cashedOutAt = multiplier;
    phase = 'cashed_out';
    if (animFrameId !== null) cancelAnimationFrame(animFrameId);
    balance.update((b) => b + localBet * cashedOutAt);
    resetTimer = setTimeout(resetToIdle, 2500);
  }

  function tick(now: number) {
    // ] held mid-game → clock slows to 20% speed (3 more time to react, barely visible)
    const dt = lastFrameTime ? (now - lastFrameTime) / 1000 : 0;
    lastFrameTime = now;
    const timeScale = isCheatKeyHeld ? 0.2 : 1;
    gameTime += dt * timeScale;

    const m = Math.exp(0.42 * gameTime);
    multiplier = Math.round(m * 100) / 100;

    if (now - lastSample >= 50) {
      history = [...history, { t: gameTime, m: multiplier }];
      lastSample = now;
    }

    if (multiplier >= crashPoint) {
      multiplier = Math.round(crashPoint * 100) / 100;
      history = [...history, { t: gameTime, m: multiplier }];
      phase = 'crashed';
      resetTimer = setTimeout(resetToIdle, 3000);
      return;
    }

    animFrameId = requestAnimationFrame(tick);
  }

  function resetToIdle() {
    if (animFrameId !== null) cancelAnimationFrame(animFrameId);
    phase = 'idle';
    multiplier = 1.0;
    history = [];
  }

  // ── SVG chart ─────────────────────────────────────────────────────────────
  const W = 760, H = 420, PAD = 32;

  function buildPaths(hist: { t: number; m: number }[]) {
    if (hist.length < 2) return { fill: '', line: '' };
    const maxT = Math.max(hist[hist.length - 1].t, 0.5);
    const maxM = Math.max(hist[hist.length - 1].m * 1.35, 2);
    const toX = (t: number) => (PAD + (t / maxT) * (W - PAD * 2)).toFixed(1);
    const toY = (m: number) => (H - PAD - ((m - 1) / (maxM - 1)) * (H - PAD * 2)).toFixed(1);
    const pts = hist.map(({ t, m }) => `${toX(t)} ${toY(m)}`);
    const botY = (H - PAD).toFixed(1);
    return {
      fill: `M ${toX(0)} ${botY} L ${pts.join(' L ')} L ${toX(hist[hist.length - 1].t)} ${botY} Z`,
      line: `M ${pts.join(' L ')}`,
    };
  }

  let paths = $derived(buildPaths(history));
  let color = $derived(
    phase === 'crashed' ? '#ef4444' : phase === 'cashed_out' ? '#60a5fa' : '#22c55e',
  );
  let isBetInvalid = $derived(localBet <= 0 || localBet > $balance);

  // ── Cheat key ─────────────────────────────────────────────────────────────
  $effect(() => {
    const dn = (e: KeyboardEvent) => { if (e.key === ']') isCheatKeyHeld = true; };
    const up = (e: KeyboardEvent) => { if (e.key === ']') isCheatKeyHeld = false; };
    window.addEventListener('keydown', dn);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', dn);
      window.removeEventListener('keyup', up);
      if (animFrameId !== null) cancelAnimationFrame(animFrameId);
      if (resetTimer !== null) clearTimeout(resetTimer);
    };
  });
</script>

<div class="flex min-h-[570px] flex-col-reverse lg:flex-row">

  <!-- ── Sidebar ─────────────────────────────────────────────────────────── -->
  <div class="flex w-full flex-col gap-5 border-r border-c-border/50 bg-c-panel p-4 lg:max-w-80">

    <div>
      <label class="mb-1 block text-xs font-semibold uppercase tracking-widest text-c-text-muted">
        Bet Amount
      </label>
      <div class="flex">
        <div class="relative flex-1">
          <input
            type="number" bind:value={localBet}
            disabled={phase !== 'idle'}
            min="0" step="0.01" inputmode="decimal"
            class={twMerge(
              'w-full rounded-l-md border border-c-border bg-c-input py-2.5 pr-2 pl-7 text-sm text-white transition hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
              isBetInvalid && phase === 'idle' && 'border-red-500',
            )}
          />
          <div class="pointer-events-none absolute top-2.5 left-3 select-none text-sm text-c-text-muted">$</div>
        </div>
        <button disabled={phase !== 'idle'}
          onclick={() => (localBet = parseFloat((localBet / 2).toFixed(2)))}
          class="touch-manipulation border-y border-c-border bg-c-surface px-4 text-sm font-bold text-c-text diagonal-fractions transition hover:not-disabled:bg-c-elevated disabled:cursor-not-allowed disabled:opacity-50"
        >½</button>
        <button disabled={phase !== 'idle'}
          onclick={() => (localBet = parseFloat((localBet * 2).toFixed(2)))}
          class="touch-manipulation rounded-r-md border border-l-0 border-c-border bg-c-surface px-4 text-sm font-bold text-c-text transition hover:not-disabled:bg-c-elevated disabled:cursor-not-allowed disabled:opacity-50"
        >2×</button>
      </div>
    </div>

    {#if phase === 'idle'}
      <button onclick={placeBet} disabled={isBetInvalid}
        class="touch-manipulation rounded-lg py-3 font-semibold text-white shadow-md transition-all bg-green-600 hover:bg-green-500 active:bg-green-700 disabled:bg-c-surface disabled:text-c-text-muted disabled:shadow-none"
      >Bet</button>

    {:else if phase === 'running'}
      <button onclick={cashOut}
        class="touch-manipulation rounded-lg py-3 font-semibold text-gray-900 shadow-md bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 transition-all"
      >Cash Out &nbsp;{multiplier.toFixed(2)}×</button>

    {:else if phase === 'cashed_out'}
      <div class="rounded-lg border border-blue-800/50 bg-blue-950/50 py-3 text-center">
        <p class="text-xs text-blue-400">Cashed out at {cashedOutAt.toFixed(2)}×</p>
        <p class="mt-0.5 text-lg font-bold text-white">+${(localBet * cashedOutAt).toFixed(2)}</p>
      </div>

    {:else}
      <div class="rounded-lg border border-red-800/50 bg-red-950/50 py-3 text-center">
        <p class="text-xs text-red-400">Crashed at {multiplier.toFixed(2)}×</p>
        <p class="mt-0.5 text-lg font-bold text-white">-${localBet.toFixed(2)}</p>
      </div>
    {/if}

    {#if phase !== 'idle'}
      <div class="mt-auto rounded-lg border border-c-border/50 bg-c-input p-3 text-xs">
        <div class="flex justify-between text-c-text-muted">
          <span>Bet</span><span class="text-white">${localBet.toFixed(2)}</span>
        </div>
        {#if phase === 'running'}
          <div class="mt-1 flex justify-between text-c-text-muted">
            <span>Profit if cashout</span>
            <span class="text-green-400">+${(localBet * (multiplier - 1)).toFixed(2)}</span>
          </div>
        {:else if phase === 'cashed_out'}
          <div class="mt-1 flex justify-between text-c-text-muted">
            <span>Profit</span><span class="text-green-400">+${(localBet * (cashedOutAt - 1)).toFixed(2)}</span>
          </div>
        {:else}
          <div class="mt-1 flex justify-between text-c-text-muted">
            <span>Lost</span><span class="text-red-400">-${localBet.toFixed(2)}</span>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <!-- ── Chart area ─────────────────────────────────────────────────────── -->
  <div class="relative flex min-h-[400px] flex-1 items-center justify-center overflow-hidden bg-c-bg">

    <svg viewBox="0 0 {W} {H}" class="absolute inset-0 h-full w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color={color} stop-opacity="0.25" />
          <stop offset="100%" stop-color={color} stop-opacity="0.02" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {#if paths.fill}
        <path d={paths.fill} fill="url(#cg)" />
        <path d={paths.line} fill="none" stroke={color} stroke-width="3"
          stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)" />
      {/if}
    </svg>

    <div class="pointer-events-none relative z-10 text-center select-none">
      {#if phase === 'idle'}
        <p class="text-2xl font-medium text-c-text-muted">Place your bet</p>
      {:else if phase === 'crashed'}
        <p class="text-6xl font-black text-red-400 sm:text-8xl tracking-tight">BUST</p>
        <p class="mt-2 text-2xl font-semibold text-red-500">{multiplier.toFixed(2)}×</p>
      {:else}
        <p class="text-6xl font-black tabular-nums sm:text-8xl tracking-tight" style:color={color}>
          {multiplier.toFixed(2)}×
        </p>
        {#if phase === 'running'}
          <p class="mt-2 text-sm font-medium text-c-text-muted tabular-nums">
            ${(localBet * multiplier).toFixed(2)}
          </p>
        {/if}
      {/if}
    </div>
  </div>
</div>
