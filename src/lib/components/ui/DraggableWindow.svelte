<script lang="ts">
  import { draggable } from '@neodrag/svelte';
  import Close from 'phosphor-svelte/lib/X';
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { scale } from 'svelte/transition';
  import { twMerge } from 'tailwind-merge';

  type Props = Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'class'> & {
    title?: Snippet;
    titleBarActions?: Snippet;
    children?: Snippet;
    class?: string;
    onClose?: () => void;
  };

  let { title, titleBarActions, children, onClose, class: className, ...props }: Props = $props();

  let dragHandleElement: HTMLDivElement | undefined = $state();
</script>

<div
  in:scale={{ duration: 200 }}
  use:draggable={{ bounds: 'body', handle: dragHandleElement }}
  class={twMerge('z-40 w-[15rem] rounded-xl bg-c-panel border border-c-border drop-shadow-2xl', className)}
  {...props}
>
  <!-- Title bar -->
  <div class="flex rounded-t-xl overflow-hidden">
    <div
      bind:this={dragHandleElement}
      class="flex flex-1 cursor-move items-center gap-2 bg-c-surface px-4 py-3"
    >
      {@render title?.()}
    </div>
    <div class="ml-auto flex">
      {@render titleBarActions?.()}
      <button
        onclick={onClose}
        class="bg-c-surface px-4 py-3 text-c-text-muted transition hover:bg-red-600 hover:text-white active:bg-red-700 active:text-white"
      >
        <Close weight="bold" />
      </button>
    </div>
  </div>

  <!-- Content -->
  <div class="p-4">
    {@render children?.()}
  </div>
</div>
