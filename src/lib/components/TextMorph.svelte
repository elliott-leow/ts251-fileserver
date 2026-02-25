<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';

	let {
		text,
		as = 'div',
		duration = 400,
		ease = 'cubic-bezier(0.19, 1, 0.22, 1)',
		locale = 'en',
		class: className = '',
		style = '',
		onAnimationComplete,
		onAnimationStart
	}: {
		text: string;
		as?: string;
		duration?: number;
		ease?: string;
		locale?: string;
		class?: string;
		style?: string;
		onAnimationComplete?: () => void;
		onAnimationStart?: () => void;
	} = $props();

	let element: HTMLElement;
	let instance = $state<any>(null);
	let ready = $state(false);

	onMount(async () => {
		if (!element) return;
		try {
			const torph = await import('torph');
			const TextMorphCore = torph.TextMorph;
			// Clear Svelte-managed content before torph takes over
			element.textContent = '';
			instance = new TextMorphCore({
				element,
				locale,
				duration,
				ease,
				onAnimationComplete,
				onAnimationStart
			});
			instance.update(text);
			ready = true;
		} catch (e) {
			console.warn('TextMorph init failed:', e);
			element.textContent = text;
		}
	});

	onDestroy(() => {
		instance?.destroy();
	});

	$effect(() => {
		const t = text;
		if (ready && instance) {
			instance.update(t);
		}
	});
</script>

<!--
  SSR: renders text as plain content for initial paint.
  Client: torph clears and takes over DOM inside element.
  The {#if !ready} block is removed from DOM once torph is active,
  preventing Svelte from fighting torph for DOM control.
-->
<svelte:element this={as} bind:this={element} class={className} {style}>
	{#if !ready}{text}{/if}
</svelte:element>
