<script lang="ts">
  import { balance, selectedCurrency, balances } from '$lib/stores/game';
  import { CURRENCIES } from '$lib/constants/game';
  import { Currency } from '$lib/types';
  import { flyAndScale } from '$lib/utils/transitions';
  import { Popover, Tabs } from 'bits-ui';
  import { twMerge } from 'tailwind-merge';
  import CaretDown from 'phosphor-svelte/lib/CaretDown';
  import Wallet from 'phosphor-svelte/lib/Wallet';
  import Plus from 'phosphor-svelte/lib/Plus';
  import Check from 'phosphor-svelte/lib/Check';

  let balanceFormatted = $derived(
    $balance.toLocaleString('en-US', {
      minimumFractionDigits: CURRENCIES[$selectedCurrency].decimals,
      maximumFractionDigits: CURRENCIES[$selectedCurrency].decimals,
    }),
  );

  const addMoneyAmounts: Record<Currency, number[]> = {
    [Currency.BTC]: [0.001, 0.005, 0.01],
    [Currency.ETH]: [0.01, 0.05, 0.1],
    [Currency.LTC]: [0.1, 0.5, 1],
    [Currency.USD]: [100, 500, 1000],
  };

  const walletAddresses: Record<Currency, string> = {
    [Currency.BTC]: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    [Currency.ETH]: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    [Currency.LTC]: 'LKyDzhnoSssMvMvYfXp075yLzG8ZyzGZyz',
    [Currency.USD]: 'mock-usd-account-123',
  };
</script>

<div class="flex items-center gap-2">
  <div class="flex overflow-hidden rounded-lg border border-c-border">
    <button
      class="flex items-center gap-2 bg-c-input px-4 py-2 text-sm font-semibold text-white tabular-nums sm:text-base transition hover:bg-c-surface"
      onclick={() => {}}
    >
      <span style:color={CURRENCIES[$selectedCurrency].iconColor} class="text-lg">
        {CURRENCIES[$selectedCurrency].symbol}
      </span>
      <span class="min-w-16 text-right">
        {balanceFormatted}
      </span>
    </button>
    <Popover.Root>
      <Popover.Trigger
        class="bg-green-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-500 active:bg-green-700 sm:text-base flex items-center gap-2"
      >
        Wallet
      </Popover.Trigger>
      <Popover.Content
        forceMount
        sideOffset={8}
        class="z-30 w-80 rounded-lg bg-c-panel border border-c-border p-0 drop-shadow-xl overflow-hidden"
      >
        {#snippet child({ wrapperProps, props, open })}
          {#if open}
            <div {...wrapperProps}>
              <div {...props} transition:flyAndScale>
                <Tabs.Root value="deposit" class="w-full">
                  <Tabs.List class="flex border-b border-c-border bg-c-input/50">
                    <Tabs.Trigger
                      value="deposit"
                      class="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-c-text-muted transition data-[state=active]:text-white data-[state=active]:bg-c-panel"
                    >
                      Deposit
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      value="currency"
                      class="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-c-text-muted transition data-[state=active]:text-white data-[state=active]:bg-c-panel"
                    >
                      Currency
                    </Tabs.Trigger>
                  </Tabs.List>

                  <Tabs.Content value="deposit" class="p-4 space-y-4">
                    <div>
                      <p class="mb-2 text-xs font-medium uppercase tracking-widest text-c-text-muted">
                        Deposit {CURRENCIES[$selectedCurrency].label}
                      </p>
                      <div class="rounded-md bg-c-input border border-c-border p-3 break-all font-mono text-[10px] text-c-text">
                        {walletAddresses[$selectedCurrency]}
                      </div>
                    </div>

                    <div class="space-y-2">
                      <p class="text-xs font-medium uppercase tracking-widest text-c-text-muted">Instant Mock Add</p>
                      <div class="grid grid-cols-3 gap-2">
                        {#each addMoneyAmounts[$selectedCurrency] as amount}
                          <button
                            onclick={() => ($balance += amount)}
                            class="touch-manipulation rounded-md bg-c-surface border border-c-border px-2 py-2 text-xs font-semibold text-white transition hover:bg-c-elevated active:bg-green-600"
                          >
                            +{amount}
                          </button>
                        {/each}
                      </div>
                    </div>
                  </Tabs.Content>

                  <Tabs.Content value="currency" class="p-2">
                    <div class="space-y-1">
                      {#each Object.entries(CURRENCIES) as [id, meta]}
                        <button
                          onclick={() => ($selectedCurrency = id as Currency)}
                          class={twMerge(
                            'w-full flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition',
                            $selectedCurrency === id ? 'bg-c-surface text-white' : 'text-c-text-muted hover:bg-c-surface/50 hover:text-white'
                          )}
                        >
                          <div class="flex items-center gap-3">
                            <span style:color={meta.iconColor} class="text-lg w-5 text-center">{meta.symbol}</span>
                            <span>{meta.label}</span>
                          </div>
                          {#if $selectedCurrency === id}
                            <Check weight="bold" class="size-4 text-green-500" />
                          {:else}
                            <span class="text-xs opacity-50">
                              {$balances[id as Currency].toLocaleString('en-US', { maximumFractionDigits: meta.decimals })}
                            </span>
                          {/if}
                        </button>
                      {/each}
                    </div>
                  </Tabs.Content>
                </Tabs.Root>
              </div>
            </div>
          {/if}
        {/snippet}
      </Popover.Content>
    </Popover.Root>
  </div>
</div>
