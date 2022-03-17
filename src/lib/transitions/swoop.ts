import { cubicOut } from 'svelte/easing';
import type { EasingFunction } from 'svelte/transition';

interface SwoopParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
}

export function swoop(
	node: HTMLElement,
	{ delay = 0, duration = 400, easing = cubicOut }: SwoopParams = {}
) {
	const { x, y, height } = node.getBoundingClientRect();
	// document.body.appendChild(node);
	const targetTop = -height - y - 200;
	const transform = node.style.transform === 'none' ? '' : node.style.transform;
	return {
		delay,
		duration,
		easing,
		css: (t: number) =>
			`position: absolute; left: ${x}px; top: ${y}px; z-index: 1000; transform: ${transform} translateY(${
				(1 - t) * targetTop
			}px);`
	};
}

export function swoopIn(node: HTMLElement, { delay = 0, duration = 400, easing = cubicOut } = {}) {
	const { x } = node.getBoundingClientRect();
	const width = window.innerWidth;
	const startRight = width + 200 - x;
	const transform = node.style.transform === 'none' ? '' : node.style.transform;
	return {
		delay,
		duration,
		easing,
		css: (t: number) =>
			`z-index: 1000; transform: ${transform} translateX(${(1 - t) * startRight}px);`
	};
}
