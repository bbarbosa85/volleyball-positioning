<script lang="ts">
  import { Share2, Sun, Moon, Settings, Box } from '@lucide/svelte';

  interface Props {
    isDarkMode?: boolean;
    onToggleTheme: () => void;
    onShare: () => void;

    showZones?: boolean;
    onToggleZones: () => void;

    showAllArrows?: boolean;
    onToggleArrows: () => void;

    showBlockShadow?: boolean;
    onToggleBlockShadow: () => void;

    is3DView?: boolean;
    onToggle3D: () => void;
  }

  let {
    isDarkMode = true,
    onToggleTheme,
    onShare,
    showZones = false,
    onToggleZones,
    showAllArrows = false,
    onToggleArrows,
    showBlockShadow = true,
    onToggleBlockShadow,
    is3DView = false,
    onToggle3D
  }: Props = $props();
</script>

<header class="w-full bg-base-100/80 backdrop-blur-md border-b border-base-200/60 sticky top-0 z-40 px-4 lg:px-8 py-2.5">
  <div class="max-w-[1720px] mx-auto flex items-center justify-between gap-4">
    <!-- Brand & Title -->
    <div class="flex items-center gap-2.5">
      <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-content shadow-md shadow-primary/30 shrink-0">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="m4.93 4.93 4.24 4.24"/>
          <path d="m14.83 9.17 4.24-4.24"/>
          <path d="M14.83 14.83 19.07 19.07"/>
          <path d="m9.17 14.83-4.24 4.24"/>
          <circle cx="12" cy="12" r="4"/>
        </svg>
      </div>
      <h1 class="text-base font-extrabold tracking-tight text-base-content m-0">
        VolleyDefense <span class="text-primary font-medium">Tactics</span>
      </h1>
    </div>

    <!-- Right Actions: Contained Share CTA + Theme Toggle + daisyUI Settings Dropdown -->
    <div class="flex items-center gap-2">
      <!-- Contained Share Button -->
      <button
        type="button"
        onclick={onShare}
        class="btn btn-sm btn-primary gap-1.5 shadow-md"
        title="Share tactical bundle via compressed link"
      >
        <Share2 class="w-3.5 h-3.5" />
        <span>Share</span>
      </button>

      <!-- Theme Toggle Button -->
      <button
        type="button"
        onclick={onToggleTheme}
        class="btn btn-sm btn-ghost btn-circle"
        title={isDarkMode ? 'Switch to Light Mode (nord)' : 'Switch to Dark Mode (business)'}
      >
        {#if isDarkMode}
          <Sun class="w-4 h-4 text-warning" />
        {:else}
          <Moon class="w-4 h-4 text-primary" />
        {/if}
      </button>

      <!-- daisyUI Settings Cog Dropdown (details/summary standard) -->
      <details class="dropdown dropdown-end">
        <summary
          class="btn btn-sm btn-ghost btn-circle list-none cursor-pointer"
          title="Court View Overlays & Settings"
        >
          <Settings class="w-4 h-4 text-base-content/70" />
        </summary>

        <ul
          class="dropdown-content menu p-2 shadow-2xl bg-base-200 border border-base-300 rounded-box w-56 z-50 text-xs mt-2"
        >
          <li class="menu-title text-[10px] uppercase font-bold tracking-wider opacity-60">
            Court View Overlays
          </li>

          <!-- Zones Toggle -->
          <li>
            <button
              type="button"
              onclick={onToggleZones}
              class="flex items-center justify-between py-1.5"
            >
              <span>Court Zones (1–6)</span>
              <span class="w-2.5 h-2.5 rounded-full {showZones ? 'bg-primary shadow-xs shadow-primary' : 'bg-base-300'}"></span>
            </button>
          </li>

          <!-- Vector Arrows Toggle -->
          <li>
            <button
              type="button"
              onclick={onToggleArrows}
              class="flex items-center justify-between py-1.5"
            >
              <span>Motion Vectors</span>
              <span class="w-2.5 h-2.5 rounded-full {showAllArrows ? 'bg-secondary shadow-xs shadow-secondary' : 'bg-base-300'}"></span>
            </button>
          </li>

          <!-- Blocker Shadow Toggle -->
          <li>
            <button
              type="button"
              onclick={onToggleBlockShadow}
              class="flex items-center justify-between py-1.5"
            >
              <span>Blocker Shadow Cone</span>
              <span class="w-2.5 h-2.5 rounded-full {showBlockShadow ? 'bg-warning shadow-xs shadow-warning' : 'bg-base-300'}"></span>
            </button>
          </li>

          <div class="divider my-1"></div>

          <!-- 3D Perspective Toggle -->
          <li>
            <button
              type="button"
              onclick={onToggle3D}
              class="flex items-center justify-between py-1.5 {is3DView ? 'text-primary font-semibold' : ''}"
            >
              <div class="flex items-center gap-1.5">
                <Box class="w-3.5 h-3.5 text-primary" />
                <span>3D Dynamic Tilt</span>
              </div>
              <span class="w-2.5 h-2.5 rounded-full {is3DView ? 'bg-primary shadow-xs shadow-primary' : 'bg-base-300'}"></span>
            </button>
          </li>
        </ul>
      </details>
    </div>
  </div>
</header>
