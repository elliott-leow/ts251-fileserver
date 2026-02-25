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
			gradient.addColorStop(1, 'transparent');
			ctx.fillStyle = gradient;
			ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
		}

		function animate() {
			time += 0.003;
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			ctx.fillStyle = '#0a0a0f';
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			const w = canvas.width;
			const h = canvas.height;

			drawOrb(
				w * 0.3 + Math.sin(time * 0.7) * w * 0.15,
				h * 0.3 + Math.cos(time * 0.5) * h * 0.1,
				w * 0.35,
				'rgba(100, 60, 180, 0.15)'
			);
			drawOrb(
				w * 0.7 + Math.cos(time * 0.6) * w * 0.12,
				h * 0.6 + Math.sin(time * 0.8) * h * 0.15,
				w * 0.3,
				'rgba(40, 100, 200, 0.12)'
			);
			drawOrb(
				w * 0.5 + Math.sin(time * 0.9) * w * 0.1,
				h * 0.8 + Math.cos(time * 0.4) * h * 0.08,
				w * 0.25,
				'rgba(180, 60, 120, 0.1)'
			);
			drawOrb(
				w * 0.15 + Math.cos(time * 0.5) * w * 0.08,
				h * 0.7 + Math.sin(time * 0.7) * h * 0.12,
				w * 0.2,
				'rgba(60, 160, 180, 0.08)'
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
