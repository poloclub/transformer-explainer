<script lang="ts">
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import { expandedBlock, modelMeta, tokens } from '~/store';
	import classNames from 'classnames';
	import PositionalEncoding from '~/components/Popovers/PositionalEncodingPopover.svelte';
	import QkvWeightPopover from '~/components/Popovers/QKVWeightPopover.svelte';
</script>

<div>
	...
	<QkvWeightPopover />
</div>
