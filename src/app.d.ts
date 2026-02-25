// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare module 'torph/svelte' {
	import type { SvelteComponent } from 'svelte';

	interface TextMorphProps {
		text: string;
		class?: string;
		style?: string;
		as?: string;
		duration?: number;
		ease?: string;
		debug?: boolean;
		disabled?: boolean;
		locale?: Intl.LocalesArgument;
		scale?: boolean;
		respectReducedMotion?: boolean;
		onAnimationStart?: () => void;
		onAnimationComplete?: () => void;
	}

	export class TextMorph extends SvelteComponent<TextMorphProps> {}
}

export {};
