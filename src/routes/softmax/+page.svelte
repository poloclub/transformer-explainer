<script lang="ts">
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import { expandedBlock, modelMeta, tokens } from '~/store';
	import classNames from 'classnames';
	// import { getMockData } from '~/utils/mockData';
	// import Softmax from '~/components/Softmax_expanded.svelte';
	// import Softmax from '~/components/Softmax.svelte';
	import Softmax from '~/components/LinearSoftmax.svelte';

	// $: mockData = getMockData($tokens.length, $modelMeta);
</script>

<Softmax></Softmax>