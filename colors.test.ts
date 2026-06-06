<script lang="ts">
  import { Select } from '$lib/components/ui';
  import { autoBetIntervalMs, rowCountOptions } from '$lib/constants/game';
  import {
    balance,
    betAmount,
    betAmountOfExistingBalls,
    plinkoEngine,
    riskLevel,
    rowCount,
  } from '$lib/stores/game';
  import { isGameSettingsOpen, isLiveStatsOpen } from '$lib/stores/layout';
  import { BetMode, RiskLevel } from '$lib/types';
  import { flyAndScale } from '$lib/utils/transitions';
  import { Popover, Tooltip } from 'bits-ui';
  import ChartLine from 'phosphor-svelte/lib/ChartLine';
  import GearSix from 'phosphor-svelte/lib/GearSix';
  import Infinity from 'phosphor-svelte/lib/Infinity';
  import Question from 'phosphor-svelte/lib/Question';
  import type { FormEventHandler } from 'svelte/elements';
  import { twMerge } from 'tailwind-merge';

  let betMode: BetMode = $state(BetMode.MANUAL);

  let autoBetInput = $state(0);
  let autoBetsLeft: number | null = $state(null);
  let autoBetInterval: ReturnType<typeof setInterval> | null = $state(null);

  let isBetAmountNegative = $derived($betAmount < 0);
  let isBetExceedBalance = $derived($betAmount > $balance);
  let isAutoBetInputNegative = $derived(autoBetInput < 0);

  let isDropBallDisabled = $derived(
    $plinkoEngine === null || isBetAmountNegative || isBetExceedBalance || isAutoBetInputNegative,
  );

  let hasOutstandingBalls = $derived(Object.keys($betAmountOfExistingBalls).length > 0);

  const handleBetAmountFocusOut: FormEventHandler<HTMLInputElement> = (e) => {
    const parsedValue = parseFloat(e.currentTarget.value.trim());
    if (isNaN(parsedValue)) {
      $betAmount = -1;
      $betAmount = 0;
    } else {
      $betAmount = parsedValue;
    }
  };

  function resetAutoBetInterval() {
    if (autoBetInterval !== null) {
      clearInterval(autoBetInterval);
      autoBetInterval = null;
    }
  }

  function autoBetDropBall() {
    if (isBetExceedBalance) {
      resetAutoBetInterval();
      return;
    }
    if (autoBetsLeft === null) {
      $plinkoEngine?.dropBall();
      return;
    }
    if (autoBetsLeft > 0) {
      $plinkoEngine?.dropBall();
      autoBetsLeft -= 1;
    }
    if (autoBetsLeft === 0 && autoBetInterval !== null) {
      resetAutoBetInterval();
      return;
    }
  }

  const handleAutoBetInputFocusOut: FormEventHandler<HTMLInputElement> = (e) => {
    const parsedValue = parseInt(e.currentTarget.value.trim());
    if (isNaN(parsedValue)) {
      autoBetInput = -1;
      autoBetInput = 0;
    } else {
      autoBetInput = parsedValue;
    }
  };

  function handleBetClick() {
    if (betMode === BetMode.MANUAL) {
      $plinkoEngine?.dropBall();
    } else if (autoBetInterval === null) {
      autoBetsLeft = autoBetInput === 0 ? null : autoBetInput;
      autoBetInterval = setInterval(autoBetDropBall, autoBetIntervalMs);
    } else if (autoBetInterval !== null) {
      resetAutoBetInterval();
    }
  }

  const betModes = [
    { value: BetMode.MANUAL, label: 'Manual' },
    { value: BetMode.AUTO, label: 'Auto' },
  ];
  const riskLevels = [
    { value: RiskLevel.LOW, label: 'Low' },
    { value: RiskLevel.MEDIUM, label: 'Medium' },
    { value: RiskLevel.HIGH, label: 'High' },
  ];
  const rowCounts = rowCountOptions.map((value) => ({ value, label: value.toString() }));
</script>

<div class="flex flex-col gap-5 bg-c-panel p-4 lg:max-w-80 border-r border-c-border/50">
  <!-- Bet mode tabs -->
  <div class="flex gap-1 rounded-full bg-c-input p-1">
    {#each betModes as { value, label }}
      <button
        disabled={autoBetInterval !== null}
        onclick={() => (betMode = value)}
        class={twMerge(
          'flex-1 rounded-full py-2 text-sm font-semibold text-c-text transition hover:not-disabled:bg-c-elevated active:not-disabled:bg-c-surface disabled:cursor-not-allowed disabled:opacity-50',
          betMode === value && 'bg-c-elevated text-white',
        )}
      >
        {label}
      </button>
    {/each}
  </div>

  <!-- Bet amount -->
  <div class="relative">
    <label for="betAmount" class="mb-1 block text-xs font-semibold uppercase tracking-widest text-c-text-muted">
      Bet Amount
    </label>
    <div class="flex">
      <div class="relative flex-1">
        <input
          id="betAmount"
          value={$betAmount}
          onfocusout={handleBetAmountFocusOut}
          disabled={autoBetInterval !== null}
          type="number"
          min="0"
          step="0.01"
          inputmode="decimal"
          class={twMerge(
            'w-full rounded-l-md border border-c-border bg-c-input py-2.5 pr-2 pl-7 text-sm text-white transition-colors hover:cursor-pointer hover:not-disabled:border-c-border-hover focus:border-c-border-hover focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
            (isBetAmountNegative || isBetExceedBalance) &&
              'border-red-500 hover:not-disabled:border-red-400 focus:border-red-400',
          )}
        />
        <div class="absolute top-2.5 left-3 text-c-text-muted select-none text-sm" aria-hidden="true">$</div>
      </div>
      <button
        disabled={autoBetInterval !== null}
        onclick={() => {
          $betAmount = parseFloat(($betAmount / 2).toFixed(2));
        }}
        class="touch-manipulation bg-c-surface border-y border-c-border px-4 text-sm font-bold text-c-text diagonal-fractions transition-colors hover:not-disabled:bg-c-elevated active:not-disabled:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        ½
      </button>
      <button
        disabled={autoBetInterval !== null}
        onclick={() => {
          $betAmount = parseFloat(($betAmount * 2).toFixed(2));
        }}
        class="touch-manipulation rounded-r-md bg-c-surface border border-c-border border-l-0 px-4 text-sm font-bold text-c-text transition-colors hover:not-disabled:bg-c-elevated active:not-disabled:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        2×
      </button>
    </div>
    {#if isBetAmountNegative}
      <p class="absolute text-xs leading-5 text-red-400">
        This must be greater than or equal to 0.
      </p>
    {:else if isBetExceedBalance}
      <p class="absolute text-xs leading-5 text-red-400">Can't bet more than your balance!</p>
    {/if}
  </div>

  <!-- Risk -->
  <div>
    <label for="riskLevel" class="mb-1 block text-xs font-semibold uppercase tracking-widest text-c-text-muted">
      Risk
    </label>
    <Select
      id="riskLevel"
      bind:value={$riskLevel}
      items={riskLevels}
      disabled={hasOutstandingBalls || autoBetInterval !== null}
    />
  </div>

  <!-- Rows -->
  <div>
    <label for="rowCount" class="mb-1 block text-xs font-semibold uppercase tracking-widest text-c-text-muted">
      Rows
    </label>
    <Select
      id="rowCount"
      bind:value={$rowCount}
      items={rowCounts}
      disabled={hasOutstandingBalls || autoBetInterval !== null}
    />
  </div>

  <!-- Auto bet count -->
  {#if betMode === BetMode.AUTO}
    <div>
      <div class="mb-1 flex items-center gap-1">
        <label for="autoBetInput" class="text-xs font-semibold uppercase tracking-widest text-c-text-muted">
          Number of Bets
        </label>
        <Popover.Root>
          <Popover.Trigger class="p-1">
            <Question class="text-c-text-muted" weight="bold" />
          </Popover.Trigger>
          <Popover.Content
            class="z-30 max-w-lg rounded-lg bg-c-panel border border-c-border p-3 text-sm font-medium text-white drop-shadow-xl"
          >
            <p>Enter '0' for unlimited bets.</p>
            <Popover.Arrow />
          </Popover.Content>
        </Popover.Root>
      </div>
      <div class="relative">
        <input
          id="autoBetInput"
          value={autoBetInterval === null ? autoBetInput : autoBetsLeft ?? 0}
          disabled={autoBetInterval !== null}
          onfocusout={handleAutoBetInputFocusOut}
          type="number"
          min="0"
          inputmode="numeric"
          class={twMerge(
            'w-full rounded-md border border-c-border bg-c-input py-2.5 pr-8 pl-3 text-sm text-white transition-colors hover:cursor-pointer hover:not-disabled:border-c-border-hover focus:border-c-border-hover focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
            isAutoBetInputNegative && 'border-red-500 hover:border-red-400 focus:border-red-400',
          )}
        />
        {#if autoBetInput === 0}
          <Infinity class="absolute top-3 right-3 size-4 text-c-text-muted" weight="bold" />
        {/if}
      </div>
      {#if isAutoBetInputNegative}
        <p class="text-xs leading-5 text-red-400">This must be greater than or equal to 0.</p>
      {/if}
    </div>
  {/if}

  <!-- Drop / Auto bet button -->
  <button
    onclick={handleBetClick}
    disabled={isDropBallDisabled}
    class={twMerge(
      'touch-manipulation rounded-lg py-3 font-semibold text-white transition-all shadow-md hover:shadow-lg disabled:bg-c-surface disabled:text-c-text-muted disabled:shadow-none',
      autoBetInterval !== null
        ? 'bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 text-gray-900'
        : 'bg-green-600 hover:bg-green-500 active:bg-green-700',
    )}
  >
    {#if betMode === BetMode.MANUAL}
      Bet
    {:else if autoBetInterval === null}
      Start Autobet
    {:else}
      Stop Autobet
    {/if}
  </button>

  <!-- Footer icons -->
  <div class="mt-auto pt-5">
    <div class="flex items-center gap-2 border-t border-c-border/50 pt-3">
      <Tooltip.Provider delayDuration={0} disableCloseOnTriggerClick>
        <!-- Settings -->
        <Tooltip.Root>
          <Tooltip.Trigger
            onclick={() => ($isGameSettingsOpen = !$isGameSettingsOpen)}
            class={twMerge(
              'rounded-lg p-2 text-c-text-muted transition hover:bg-c-surface hover:text-white active:bg-c-elevated',
              $isGameSettingsOpen && 'bg-c-surface text-white',
            )}
          >
            <GearSix class="size-5" weight="fill" />
          </Tooltip.Trigger>
          <Tooltip.Content
            forceMount
            sideOffset={4}
            class="z-30 max-w-lg rounded-lg bg-c-panel border border-c-border p-3 text-sm font-medium text-white drop-shadow-xl"
          >
            {#snippet child({ wrapperProps, props, open })}
              {#if open}
                <div {...wrapperProps}>
                  <div {...props} transition:flyAndScale>
                    <Tooltip.Arrow class="text-c-panel" />
                    <p>{$isGameSettingsOpen ? 'Close' : 'Open'} Game Settings</p>
                  </div>
                </div>
              {/if}
            {/snippet}
          </Tooltip.Content>
        </Tooltip.Root>

        <!-- Live Stats -->
        <Tooltip.Root>
          <Tooltip.Trigger
            onclick={() => ($isLiveStatsOpen = !$isLiveStatsOpen)}
            class={twMerge(
              'rounded-lg p-2 text-c-text-muted transition hover:bg-c-surface hover:text-white active:bg-c-elevated',
              $isLiveStatsOpen && 'bg-c-surface text-white',
            )}
          >
            <ChartLine class="size-5" weight="bold" />
          </Tooltip.Trigger>
          <Tooltip.Content
            forceMount
            sideOffset={4}
            class="z-30 max-w-lg rounded-lg bg-c-panel border border-c-border p-3 text-sm font-medium text-white drop-shadow-xl"
          >
            {#snippet child({ wrapperProps, props, open })}
              {#if open}
                <div {...wrapperProps}>
                  <div {...props} transition:flyAndScale>
                    <Tooltip.Arrow class="text-c-panel" />
                    <p>{$isLiveStatsOpen ? 'Close' : 'Open'} Live Stats</p>
                  </div>
                </div>
              {/if}
            {/snippet}
          </Tooltip.Content>
        </Tooltip.Root>
      </Tooltip.Provider>
    </div>
  </div>
</div>
