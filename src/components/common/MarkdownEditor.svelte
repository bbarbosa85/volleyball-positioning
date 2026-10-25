<script lang="ts">
  import { Bold, Italic, Heading3, List, Quote, Eye, Edit3 } from '@lucide/svelte';
  import { renderMarkdown } from '../../utils/markdown';

  interface Props {
    value: string;
    onchange?: (val: string) => void;
    placeholder?: string;
    rows?: number;
    label?: string;
    id?: string;
  }

  let {
    value = $bindable(''),
    onchange,
    placeholder = 'Write tactical notes (supports **bold**, *italic*, lists, headings)...',
    rows = 3,
    label,
    id = 'markdown-editor'
  }: Props = $props();

  let activeTab = $state<'write' | 'preview'>('write');
  let textareaEl = $state<HTMLTextAreaElement | null>(null);

  const previewHtml = $derived(value ? renderMarkdown(value) : '');

  function insertFormatting(prefix: string, suffix: string = '') {
    if (!textareaEl) return;
    const start = textareaEl.selectionStart;
    const end = textareaEl.selectionEnd;
    const selected = value.substring(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;
    const nextValue = value.substring(0, start) + replacement + value.substring(end);
    value = nextValue;
    onchange?.(nextValue);

    // Re-focus and update cursor
    setTimeout(() => {
      if (textareaEl) {
        textareaEl.focus();
        textareaEl.setSelectionRange(start + prefix.length, start + prefix.length + (selected ? selected.length : 4));
      }
    }, 10);
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    value = target.value;
    onchange?.(target.value);
  }
</script>

<div class="flex flex-col gap-1.5 w-full">
  {#if label}
    <div class="flex items-center justify-between">
      <label for={id} class="font-bold text-xs text-base-content/90">
        {label}
      </label>
      <span class="text-[10px] opacity-60">Markdown supported</span>
    </div>
  {/if}

  <div class="border border-base-300 rounded-xl overflow-hidden bg-base-100 flex flex-col focus-within:border-primary/80 focus-within:ring-1 focus-within:ring-primary/40 transition-all">
    <!-- Top toolbar & Write/Preview tab switcher -->
    <div class="flex items-center justify-between px-2.5 py-1.5 bg-base-200/80 border-b border-base-300 gap-2 flex-wrap">
      <!-- Formatting tools (visible in Write mode) -->
      <div class="flex items-center gap-1">
        {#if activeTab === 'write'}
          <button
            type="button"
            onclick={() => insertFormatting('**', '**')}
            class="btn btn-ghost btn-xs btn-square h-6 w-6"
            title="Bold (**text**)"
          >
            <Bold class="w-3 h-3" />
          </button>
          <button
            type="button"
            onclick={() => insertFormatting('*', '*')}
            class="btn btn-ghost btn-xs btn-square h-6 w-6"
            title="Italic (*text*)"
          >
            <Italic class="w-3 h-3" />
          </button>
          <button
            type="button"
            onclick={() => insertFormatting('### ')}
            class="btn btn-ghost btn-xs btn-square h-6 w-6"
            title="Heading 3 (### Heading)"
          >
            <Heading3 class="w-3 h-3" />
          </button>
          <button
            type="button"
            onclick={() => insertFormatting('- ')}
            class="btn btn-ghost btn-xs btn-square h-6 w-6"
            title="Bullet List (- item)"
          >
            <List class="w-3 h-3" />
          </button>
          <button
            type="button"
            onclick={() => insertFormatting('> ')}
            class="btn btn-ghost btn-xs btn-square h-6 w-6"
            title="Quote (> note)"
          >
            <Quote class="w-3 h-3" />
          </button>
        {/if}
      </div>

      <!-- Write / Preview Tabs -->
      <div class="inline-flex rounded-lg bg-base-300/60 p-0.5 gap-0.5">
        <button
          type="button"
          onclick={() => activeTab = 'write'}
          class="btn btn-xs h-6 px-2 text-[11px] font-bold border-none {activeTab === 'write' ? 'btn-primary' : 'btn-ghost text-base-content/70'}"
        >
          <Edit3 class="w-3 h-3 mr-1" />
          <span>Write</span>
        </button>
        <button
          type="button"
          onclick={() => activeTab = 'preview'}
          class="btn btn-xs h-6 px-2 text-[11px] font-bold border-none {activeTab === 'preview' ? 'btn-primary' : 'btn-ghost text-base-content/70'}"
        >
          <Eye class="w-3 h-3 mr-1" />
          <span>Preview</span>
        </button>
      </div>
    </div>

    <!-- Main Editor Content Area -->
    {#if activeTab === 'write'}
      <textarea
        bind:this={textareaEl}
        {id}
        value={value}
        oninput={handleInput}
        {placeholder}
        {rows}
        class="textarea textarea-ghost w-full text-xs p-3 focus:outline-none resize-y border-none leading-relaxed"
      ></textarea>
    {:else}
      <div class="p-3 min-h-[76px] text-xs leading-relaxed text-base-content/90">
        {#if previewHtml}
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html previewHtml}
        {:else}
          <p class="text-base-content/50 italic my-1">Nothing to preview yet. Switch to Write to enter text.</p>
        {/if}
      </div>
    {/if}
  </div>
</div>
