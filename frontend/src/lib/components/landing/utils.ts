import type { Action } from 'svelte/action';

export const spotlight: Action<HTMLElement> = (node) => {
	const move = (event: PointerEvent) => {
		const box = node.getBoundingClientRect();
		node.style.setProperty('--mx', `${event.clientX - box.left}px`);
		node.style.setProperty('--my', `${event.clientY - box.top}px`);
	};

	node.addEventListener('pointermove', move);
	return { destroy: () => node.removeEventListener('pointermove', move) };
};

export function lockScroll() {
	const root = document.documentElement;
	const gutter = window.innerWidth - root.clientWidth;
	const overflow = root.style.overflow;
	const padding = root.style.paddingRight;

	root.style.overflow = 'hidden';
	if (gutter > 0) root.style.paddingRight = `${gutter}px`;

	return () => {
		root.style.overflow = overflow;
		root.style.paddingRight = padding;
	};
}

export const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
