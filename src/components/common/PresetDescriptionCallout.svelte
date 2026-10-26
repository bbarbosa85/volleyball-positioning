<script lang="ts">
  import { Info } from "@lucide/svelte";
  import { renderMarkdown } from "../../utils/markdown";

  interface Props {
    description?: string;
    defensiveKey?: string;
    accent?: "blue" | "rose";
  }

  let { description, defensiveKey, accent = "blue" }: Props = $props();

  const formattedDescription = $derived(description ? renderMarkdown(description) : "");
</script>

{#if description || defensiveKey}
  <div role="alert" class="alert my-2">
    <Info class="w-5 h-5 shrink-0 my-1 text-info" />
    <div class="flex-1 min-w-0">
      {#if description}
        <div class="leading-relaxed font-normal opacity-95 text-xs prose-xs">
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html formattedDescription}
        </div>
      {/if}
      {#if defensiveKey}
        <div class="mt-2 pt-2 border-t border-info/20 text-xs font-normal">
          <span class="font-bold uppercase tracking-wider text-warning mr-1">Key:</span>
          <span class="opacity-95">{defensiveKey}</span>
        </div>
      {/if}
    </div>
  </div>
{/if}
