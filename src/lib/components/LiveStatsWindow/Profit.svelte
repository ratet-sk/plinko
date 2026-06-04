<script lang="ts">
  import { winRecords } from '$lib/stores/game';
  import { formatCurrency } from '$lib/utils/numbers';
  import { twMerge } from 'tailwind-merge';

  let profit = $derived($winRecords.reduce((acc, { profit }) => acc + profit, 0));
  let wins = $derived($winRecords.filter(({ profit }) => profit >= 0).length);
  let losses = $derived($winRecords.filter(({ profit }) => profit < 0).length);

  let winsFormatted = $derived(wins.toLocaleString('en-US'));
  let lossesFormatted = $derived(losses.toLocaleString('en-US'));
</script>

<div class="flex rounded-lg bg-c-input border border-c-border/50 p-4 text-sm">
  <div class="flex-1">
    <p class="text-xs font-semibold uppercase tracking-widest text-c-text-muted">Profit</p>
    <p
      class={twMerge('font-semibold tabular-nums mt-0.5', profit >= 0 ? 'text-green-400' : 'text-red-400')}
    >
      {formatCurrency(profit)}
    </p>
  </div>
  <div class="mx-4 w-px bg-c-border" aria-hidden="true"></div>
  <div class="flex-1 space-y-2">
    <div>
      <p class="text-xs font-semibold uppercase tracking-widest text-c-text-muted">Wins</p>
      <p class="font-semibold text-green-400 tabular-nums">{winsFormatted}</p>
    </div>
    <div>
      <p class="text-xs font-semibold uppercase tracking-widest text-c-text-muted">Losses</p>
      <p class="font-semibold text-red-400 tabular-nums">{lossesFormatted}</p>
    </div>
  </div>
</div>
