<script>
  import { onMount } from "svelte";
  import WaferMapPanel from "./components/WaferMapPanel.svelte";

  // public 폴더에 둔 JSON
  const DATA_URL = "/wafer_bin.json";

  let wafers = [];
  let currentIndex = 0;
  let loading = true;
  let error = "";

  // 현재 선택된 wafer
  $: currentWafer = wafers.length ? wafers[currentIndex] : null;

  onMount(async () => {
    try {
      const res = await fetch(DATA_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      wafers = data;
      currentIndex = 0;
    } catch (e) {
      console.error(e);
      error = String(e);
    } finally {
      loading = false;
    }
  });

  function next() {
    if (!wafers.length) return;
    currentIndex = (currentIndex + 1) % wafers.length;
  }

  function prev() {
    if (!wafers.length) return;
    currentIndex = (currentIndex - 1 + wafers.length) % wafers.length;
  }
</script>

<div class="min-h-screen flex flex-col bg-slate-900 text-slate-100">
  <!-- 상단 바 -->
  <header class="flex items-center justify-between px-6 py-3 border-b border-slate-700">
    <div class="font-semibold text-lg">
      Wafer Map Viewer
    </div>

    {#if currentWafer}
      <div class="flex items-center gap-3">
        <button class="px-3 py-1 border rounded bg-slate-800" on:click={prev}>
          &lt;
        </button>
        <div>
          Wafer {currentWafer.wafer}
          <span class="text-slate-400 ml-2">
            (Lot {currentWafer.lot})
          </span>
          <span class="ml-4">
            {currentIndex + 1} / {wafers.length}
          </span>
        </div>
        <button class="px-3 py-1 border rounded bg-slate-800" on:click={next}>
          &gt;
        </button>
      </div>
    {/if}
  </header>

  <!-- 본문 -->
  <main class="flex-1 flex items-center justify-center p-6">
    {#if loading}
      <div class="text-slate-300">Loading wafer data...</div>
    {:else if error}
      <div class="text-red-400">Error: {error}</div>
    {:else if !currentWafer}
      <div class="text-slate-300">No wafer data.</div>
    {:else}
      <WaferMapPanel wafer={currentWafer} />
    {/if}
  </main>
</div>
