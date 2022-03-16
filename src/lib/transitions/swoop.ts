import { cubicOut } from 'svelte/easing';

export function swoop(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
	const { x, y, height } = node.getBoundingClientRect();
	document.body.appendChild(node);
	const targetTop = -height - y - 200;
	const transform = node.style.transform === 'none' ? '' : node.style.transform;
	return {
		delay,
		duration,
		easing,
		css: (t) =>
			`position: absolute; left: ${x}px; top: ${y}px; z-index: 1000; transform: ${transform} translateY(${
				(1 - t) * targetTop
			}px);`
	};
}

export function swoopIn(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
	const { x } = node.getBoundingClientRect();
	const width = window.innerWidth;
	const startRight = width + 200 - x;
	const transform = node.style.transform === 'none' ? '' : node.style.transform;
	return {
		delay,
		duration,
		easing,
		css: (t) => `z-index: 1000; transform: ${transform} translateX(${(1 - t) * startRight}px);`
	};
}
