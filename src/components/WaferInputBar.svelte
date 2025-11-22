<script lang="ts">
  import { createEventDispatcher } from "svelte";

  // 부모에게 값을 알려주기 위한 이벤트 디스패처
  const dispatch = createEventDispatcher<{
    submit: { waferId: string; lotId: string; message: string };
  }>();

  let waferId = "";
  let lotId = "";
  let message = "";

  function handleGenerate() {
    // 나중에 부모에서 on:submit 으로 받아서 실제 필터링에 사용하면 됨
    dispatch("submit", { waferId, lotId, message });
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      handleGenerate();
    }
  }
</script>

<!-- 상단 흰색 바 + 인풋들 -->
<div class="border-b bg-white">
  <div
    class="max-w-7xl mx-auto flex flex-wrap items-center gap-3 px-6 py-3"
  >
    <!-- 왼쪽 타이틀 -->
    <div class="text-sm font-semibold text-slate-700 whitespace-nowrap">
      Wafer Analyzer
    </div>

    <!-- Wafer ID -->
    <input
      class="h-8 w-32 rounded border border-slate-300 bg-slate-50 px-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      placeholder="Wafer ID"
      bind:value={waferId}
      on:keydown={handleKeydown}
    />

    <!-- Lot -->
    <input
      class="h-8 w-32 rounded border border-slate-300 bg-slate-50 px-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      placeholder="Lot"
      bind:value={lotId}
      on:keydown={handleKeydown}
    />

    <!-- 추가 옵션 / 메모 -->
    <input
      class="h-8 flex-1 min-w-[160px] rounded border border-slate-300 bg-slate-50 px-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      placeholder="추가 옵션…"
      bind:value={message}
      on:keydown={handleKeydown}
    />

    <!-- Generate 버튼 -->
    <button
      class="h-8 px-4 rounded border border-slate-300 bg-slate-100 text-sm font-medium text-slate-800 hover:bg-slate-200 active:bg-slate-300"
      on:click={handleGenerate}
      type="button"
    >
      Generate
    </button>
  </div>
</div>
