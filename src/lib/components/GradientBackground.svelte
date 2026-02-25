<script lang="ts">
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;
	let animationId: number;

	onMount(() => {
		const ctx = canvas.getContext('2d')!;
		let time = 0;

		function resize() {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		}

		function drawOrb(x: number, y: number, radius: number, color: string) {
			const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
			gradient.addColorStop(0, color);
			gradient.addColorStop(0.6, color.replace(/[\d.]+\)$/, (m) => `${parseFloat(m) * 0.4})`));
			gradient.addColorStop(1, 'transparent');
			ctx.fillStyle = gradient;
			ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
		}

		function animate() {
			time += 0.002;
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			ctx.fillStyle = '#08080d';
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			const w = canvas.width;
			const h = canvas.height;

			// Deep purple — top-left drift
			drawOrb(
				w * 0.25 + Math.sin(time * 0.6) * w * 0.12,
				h * 0.25 + Math.cos(time * 0.4) * h * 0.1,
				w * 0.38,
				'rgba(90, 50, 170, 0.14)'
			);

			// Ocean blue — right side
			drawOrb(
				w * 0.72 + Math.cos(time * 0.5) * w * 0.1,
				h * 0.55 + Math.sin(time * 0.7) * h * 0.12,
				w * 0.32,
				'rgba(35, 90, 200, 0.11)'
			);

			// Magenta — bottom
			drawOrb(
				w * 0.45 + Math.sin(time * 0.8) * w * 0.08,
				h * 0.82 + Math.cos(time * 0.35) * h * 0.06,
				w * 0.28,
				'rgba(170, 50, 110, 0.09)'
			);

			// Teal — lower-left
			drawOrb(
				w * 0.12 + Math.cos(time * 0.45) * w * 0.07,
				h * 0.68 + Math.sin(time * 0.6) * h * 0.1,
				w * 0.22,
				'rgba(50, 150, 170, 0.07)'
			);

			// Warm accent — subtle center highlight
			drawOrb(
				w * 0.55 + Math.sin(time * 0.3) * w * 0.05,
				h * 0.4 + Math.cos(time * 0.55) * h * 0.06,
				w * 0.18,
				'rgba(180, 140, 80, 0.04)'
			);

			animationId = requestAnimationFrame(animate);
		}

		resize();
		window.addEventListener('resize', resize);
		animate();

		return () => {
			window.removeEventListener('resize', resize);
			cancelAnimationFrame(animationId);
		};
	});
</script>

<canvas bind:this={canvas} class="gradient-bg"></canvas>

<style>
	.gradient-bg {
		position: fixed;
		inset: 0;
		z-index: -1;
		pointer-events: none;
	}
</style>
