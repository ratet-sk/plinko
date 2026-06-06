<script lang="ts">
  import { totalProfitHistory, winRecords } from '$lib/stores/game';
  import { isLiveStatsOpen } from '$lib/stores/layout';
  import { flyAndScale } from '$lib/utils/transitions';
  import { Tooltip } from 'bits-ui';
  import ArrowClockwise from 'phosphor-svelte/lib/ArrowClockwise';
  import ChartLine from 'phosphor-svelte/lib/ChartLine';
  import DraggableWindow from '../ui/DraggableWindow.svelte';
  import Profit from './Profit.svelte';
  import ProfitHistoryChart from './ProfitHistoryChart.svelte';

  function resetLiveStats() {
    $winRecords = [];
    $totalProfitHistory = [0];
  }
</script>

{#if $isLiveStatsOpen}
  <DraggableWindow
    onClose={() => ($isLiveStatsOpen = false)}
    class="fixed right-8 bottom-8 w-[20rem]"
  >
    {#snippet title()}
      <ChartLine weight="bold" class="text-xl text-c-text" />
      <p class="text-sm font-semibold text-white">Live Stats</p>
    {/snippet}

    {#snippet titleBarActions()}
      <Tooltip.Provider delayDuration={0} disableCloseOnTriggerClick>
        <Tooltip.Root>
          <Tooltip.Trigger
            onclick={resetLiveStats}
            class="bg-c-surface px-4 py-3 text-c-text-muted transition hover:bg-c-elevated hover:text-white active:bg-c-input"
          >
            <ArrowClockwise weight="bold" />
          </Tooltip.Trigger>
          <Tooltip.Content
            forceMount
            sideOffset={4}
            class="z-50 max-w-lg rounded-lg bg-c-panel border border-c-border p-3 text-sm font-medium text-white drop-shadow-xl"
          >
            {#snippet child({ wrapperProps, props, open })}
              {#if open}
                <div {...wrapperProps}>
                  <div {...props} transition:flyAndScale>
                    <Tooltip.Arrow class="text-c-panel" />
                    <p>Reset Live Stats</p>
                  </div>
                </div>
              {/if}
            {/snippet}
          </Tooltip.Content>
        </Tooltip.Root>
      </Tooltip.Provider>
    {/snippet}

    <div class="flex flex-col gap-4">
      <Profit />
      <ProfitHistoryChart />
    </div>
  </DraggableWindow>
{/if}
