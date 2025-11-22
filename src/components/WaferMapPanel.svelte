<script>
  // 부모(WaferPage)에서 넘겨주는 wafer 한 장
  export let wafer;

  const cellSize = 10; // px

  // BIN → 색상 매핑
  const binColors = {
    "0":  "#111111",  // pass (검정 배경에 살짝 어두운 회색)
    "JW": "#2665ff",
    "JP": "#ff3366",
    "XD": "#22cc88",
    "I":  "#ffdd33",
    "IP": "#ff9955"
  };

  function getBinColor(die) {
    const bin = die && die.fail_bin ? die.fail_bin : "0";
    return binColors[bin] || "#444444";
  }

  // row/col 범위 계산
  $: rowMin = wafer ? wafer.row_min : 0;
  $: rowMax = wafer ? wafer.row_max : -1;
  $: colMin = wafer ? wafer.col_min : 0;
  $: colMax = wafer ? wafer.col_max : -1;

  $: rowCount = rowMax - rowMin + 1;
  $: colCount = colMax - colMin + 1;

  $: svgWidth = colCount * cellSize;
  $: svgHeight = rowCount * cellSize;
</script>

{#if !wafer}
  <div class="text-slate-300">No wafer data.</div>
{:else}
  <div class="flex flex-col items-center gap-4">
    <div class="text-slate-300">
      Wafer {wafer.wafer} (Lot {wafer.lot})
    </div>

    <!-- 여기서만 dies 를 사용하고, 절대 텍스트로 {die} 를 찍지 않는다 -->
    <svg
      width={svgWidth}
      height={svgHeight}
      style="background:#000"
    >
      {#each wafer.dies as die (die.row + '-' + die.col)}
        <rect
          x={(die.col - colMin) * cellSize}
          y={(rowMax - die.row) * cellSize}
          width={cellSize}
          height={cellSize}
          fill={getBinColor(die)}
        />
      {/each}
    </svg>
  </div>
{/if}
