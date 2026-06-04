<script lang="ts">
  import { Switch } from 'bits-ui';
  import { twMerge } from 'tailwind-merge';

  type Props = Omit<Switch.Props, 'class'> & {
    class?: string;
  };

  let { checked = $bindable(undefined), class: className, ...props }: Props = $props();
</script>

<Switch.Root
  bind:checked
  class={twMerge(
    'h-6 w-11 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:ring-1 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-c-panel focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-c-input',
    className,
  )}
  {...props}
>
  <Switch.Thumb
    class="pointer-events-none block size-5 rounded-full bg-white ring-0 shadow-lg transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
  />
</Switch.Root>
