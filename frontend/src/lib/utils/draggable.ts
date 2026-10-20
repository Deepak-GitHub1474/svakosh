import type { Action } from 'svelte/action';

const CONTROLS = 'input, textarea, select, button, a, label, [role="switch"]';
const SNAP = 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)';

export const draggable: Action<HTMLElement, boolean | undefined> = (node, enabled = true) => {
	let x = 0;
	let y = 0;
	let startX = 0;
	let startY = 0;

	function move(nextX: number, nextY: number) {
		x = nextX;
		y = nextY;
		node.style.transform = `translate(${x}px, ${y}px)`;
	}

	function keepInView() {
		if (!enabled) return;
		const rect = node.getBoundingClientRect();
		const top = document.querySelector('[data-app-header]')?.getBoundingClientRect().bottom ?? 0;
		const dx = rect.left < 0 ? -rect.left : rect.right > innerWidth ? innerWidth - rect.right : 0;
		const dy =
			rect.top < top ? top - rect.top : rect.bottom > innerHeight ? innerHeight - rect.bottom : 0;
		if (!dx && !dy) return;
		node.style.transition = SNAP;
		node.addEventListener('transitionend', () => (node.style.transition = ''), { once: true });
		move(x + dx, y + dy);
	}

	function onMove(e: PointerEvent) {
		move(e.clientX - startX, e.clientY - startY);
	}

	function onUp(e: PointerEvent) {
		if (node.hasPointerCapture(e.pointerId)) node.releasePointerCapture(e.pointerId);
		node.removeEventListener('pointermove', onMove);
		node.removeEventListener('pointerup', onUp);
		node.removeEventListener('pointercancel', onUp);
		node.style.cursor = 'grab';
		node.style.transition = '';
		keepInView();
	}

	function onDown(e: PointerEvent) {
		if (!enabled || e.button !== 0 || (e.target as Element).closest(CONTROLS)) return;
		e.preventDefault();
		startX = e.clientX - x;
		startY = e.clientY - y;
		node.setPointerCapture(e.pointerId);
		node.style.transition = 'none';
		node.style.cursor = 'grabbing';
		node.addEventListener('pointermove', onMove);
		node.addEventListener('pointerup', onUp);
		node.addEventListener('pointercancel', onUp);
	}

	function setEnabled(next: boolean) {
		enabled = next;
		node.style.cursor = enabled ? 'grab' : '';
		node.style.touchAction = enabled ? 'none' : '';
		if (!enabled && (x || y)) move(0, 0);
	}

	setEnabled(enabled);
	node.addEventListener('pointerdown', onDown);
	window.addEventListener('resize', keepInView);

	return {
		update: (next = true) => setEnabled(next),
		destroy() {
			node.removeEventListener('pointerdown', onDown);
			node.removeEventListener('pointermove', onMove);
			node.removeEventListener('pointerup', onUp);
			node.removeEventListener('pointercancel', onUp);
			window.removeEventListener('resize', keepInView);
		}
	};
};
