<script lang="ts">
  import WaferInputBar from "../components/WaferInputBar.svelte";
  import WaferPage from "../components/WaferPage.svelte";

  function handleSubmit(event) {
    const { waferId, lotId, message } = event.detail;
    console.log("검색 조건:", waferId, lotId, message);
    // 나중에 여기서 wafer 필터링 로직 넣으면 됨
  }
</script>

<WaferInputBar on:submit={handleSubmit} />
<WaferPage />
