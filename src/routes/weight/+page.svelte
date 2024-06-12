<script lang="ts">
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import { expandedBlock, modelMeta, tokens } from '~/store';
	import classNames from 'classnames';
	import PositionalEncoding from '~/components/Popovers/PositionalEncodingPopover.svelte';
	import WeightPopover from '~/components/Popovers/WeightPopover.svelte';
</script>

<WeightPopover open={true} triggeredBy={'body'}></WeightPopover>
