<script lang="ts">
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import { expandedBlock, modelMeta, tokens } from '~/store';
	import classNames from 'classnames';
	// import { getMockData } from '~/utils/mockData';
	// import Mlp from '~/components/blocks/TransformerBlock/MLP/MLP.svelte';
	import Softmax from '~/components/Softmax.svelte';

	// $: mockData = getMockData($tokens.length, $modelMeta);
</script>

<Softmax></Softmax>