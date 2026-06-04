<script lang="ts">
  import { balance } from '$lib/stores/game';
  import { flyAndScale } from '$lib/utils/transitions';
  import { Popover } from 'bits-ui';

  let balanceFormatted = $derived(
    $balance.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
  );

  const addMoneyAmounts = [100, 500, 1000];
</script>

<div class="flex overflow-hidden rounded-lg border border-c-border">
  <div
    class="flex items-center gap-2 bg-c-input px-4 py-2 text-sm font-semibold text-white tabular-nums sm:text-base"
  >
    <span class="text-c-text-muted select-none text-xs font-normal">$</span>
    <span class="min-w-16 text-right">
      {balanceFormatted}
    </span>
  </div>
  <Popover.Root>
    <Popover.Trigger
      class="bg-green-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-500 active:bg-green-700 sm:text-base"
    >
      Add
    </Popover.Trigger>
    <Popover.Content
      forceMount
      sideOffset={8}
      class="z-30 max-w-lg space-y-2 rounded-lg bg-c-panel border border-c-border p-3 drop-shadow-xl"
    >
      {#snippet child({ wrapperProps, props, open })}
        {#if open}
          <div {...wrapperProps}>
            <div {...props} transition:flyAndScale>
              <p class="mb-2 text-xs font-medium uppercase tracking-widest text-c-text-muted">Add Funds</p>
              <div class="flex gap-2">
                {#each addMoneyAmounts as amount}
                  <button
                    onclick={() => ($balance += amount)}
                    class="touch-manipulation rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-500 active:bg-green-700"
                  >
                    +${amount}
                  </button>
                {/each}
              </div>
            </div>
          </div>
        {/if}
      {/snippet}
    </Popover.Content>
  </Popover.Root>
</div>
