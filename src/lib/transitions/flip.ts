import { cubicOut } from 'svelte/easing';
import type { EasingFunction, TransitionConfig } from 'svelte/transition';

export interface FlipParams {
	delay?: number;
	duration?: number | ((len: number) => number);
	easing?: EasingFunction;
}
type Flip = (params: FlipParams) => [
	(
		node: HTMLElement,
		params: FlipParams & {
			key: unknown;
		}
	) => () => TransitionConfig,
	(
		node: HTMLElement,
		params: FlipParams & {
			key: unknown;
		}
	) => () => TransitionConfig
];

export const flip: Flip = ({
	delay = 0,
	duration = (d) => Math.sqrt(d) * 30,
	easing = cubicOut
} = {}) => {
	const toReceive = new Map();
	const toSend = new Map();
	function flip(from: DOMRect, node: HTMLElement) {
		const to = node.getBoundingClientRect();
		const dx = from.left - to.left;
		const dy = from.top - to.top;
		const dw = from.width / to.width;
		const dh = from.height / to.height;
		const d = Math.sqrt(dx * dx + dy * dy);
		const style = getComputedStyle(node);
		const transform = style.transform === 'none' ? '' : style.transform;
		if (style.display === 'inline') {
			console.error('cannot flip inline elements');
		}
		return {
			delay,
			duration: typeof duration === 'function' ? duration(d) : duration,
			easing,
			css: (t: number, u: number) => `
      transform-origin: top left;
      transform: ${transform} translate(${u * dx}px,${u * dy}px) scale(${t + (1 - t) * dw}, ${
				t + (1 - t) * dh
			});
    `
		};
	}
	type PartMap = Map<unknown, { rect: DOMRect }>;

	function transition(items: PartMap, counterparts: PartMap) {
		return (node: HTMLElement, params: { key: unknown }) => {
			items.set(params.key, {
				rect: node.getBoundingClientRect()
			});
			return () => {
				if (counterparts.has(params.key)) {
					const { rect } = counterparts.get(params.key);
					counterparts.delete(params.key);
					return flip(rect, node);
				}
				items.delete(params.key);
				return { delay: 0, duration: 0 };
			};
		};
	}
	return [transition(toSend, toReceive), transition(toReceive, toSend)];
};
