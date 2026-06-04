<script lang="ts">
  import { DEFAULT_BALANCE } from '$lib/constants/game';
  import { balance } from '$lib/stores/game';
  import { isGameSettingsOpen } from '$lib/stores/layout';
  import { isAnimationOn } from '$lib/stores/settings';
  import { hasPreferReducedMotion } from '$lib/utils/settings';
  import { Label } from 'bits-ui';
  import GearSix from 'phosphor-svelte/lib/GearSix';
  import { DraggableWindow, Switch } from '../ui';

  $effect(() => {
    if (hasPreferReducedMotion()) {
      $isAnimationOn = false;
    }
  });
</script>

{#if $isGameSettingsOpen}
  <DraggableWindow
    onClose={() => ($isGameSettingsOpen = false)}
    class="fixed bottom-8 left-8 w-[18rem]"
  >
    {#snippet title()}
      <GearSix weight="fill" class="text-xl text-c-text" />
      <p class="text-sm font-semibold text-white">Game Settings</p>
    {/snippet}

    <div class="flex flex-col gap-5">
      <div class="flex items-center gap-4">
        <Switch id="isAnimationOn" bind:checked={$isAnimationOn} />
        <Label.Root for="isAnimationOn" class="text-sm text-c-text">Animations</Label.Root>
      </div>

      <button
        onclick={() => ($balance = DEFAULT_BALANCE)}
        class="touch-manipulation self-start rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500 active:bg-red-700"
      >
        Reset Balance
      </button>
    </div>
  </DraggableWindow>
{/if}
