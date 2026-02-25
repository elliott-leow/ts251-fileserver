<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

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
	let instance: any = null;

	onMount(async () => {
		if (!element) return;
		// Dynamic import to avoid SSR issues (torph uses DOM APIs)
		const { TextMorph: TextMorphCore } = await import('torph');
		instance = new TextMorphCore({
			element,
			locale,
			duration,
			ease,
			onAnimationComplete,
			onAnimationStart
		});
		instance.update(text);
	});

	onDestroy(() => {
		instance?.destroy();
	});

	$effect(() => {
		if (instance && text) {
			instance.update(text);
		}
	});
</script>

<!-- Render the text as fallback for SSR, torph takes over on client -->
<svelte:element this={as} bind:this={element} class={className} {style}>
	{#if !browser}{text}{/if}
</svelte:element>
