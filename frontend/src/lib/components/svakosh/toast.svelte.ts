export type ToastType = 'message' | 'success' | 'error' | 'warning';

export type ToastPosition =
	| 'top-right'
	| 'top-left'
	| 'top-center'
	| 'bottom-left'
	| 'bottom-center'
	| 'bottom-right';

export type ToastAction = { label: string; onClick: () => void };

export type ToastOptions = {
	title?: string;
	description?: string;
	duration?: number;
	position?: ToastPosition;
	action?: ToastAction;
};

export type ToastItem = {
	id: number;
	type: ToastType;
	title?: string;
	description?: string;
	duration: number;
	position: ToastPosition;
	action?: ToastAction;
};

let seq = 0;

class ToastStore {
	items = $state<ToastItem[]>([]);

	push(type: ToastType, options: ToastOptions = {}): number {
		const id = ++seq;
		this.items.push({
			id,
			type,
			title: options.title,
			description: options.description,
			duration: options.duration ?? 3000,
			position: options.position ?? 'top-right',
			action: options.action
		});
		return id;
	}

	dismiss(id: number): void {
		this.items = this.items.filter((t) => t.id !== id);
	}
}

export const toastStore = new ToastStore();

export const toast = {
	message: (options?: ToastOptions) => toastStore.push('message', options),
	success: (options?: ToastOptions) => toastStore.push('success', options),
	error: (options?: ToastOptions) => toastStore.push('error', options),
	warning: (options?: ToastOptions) => toastStore.push('warning', options),
	dismiss: (id: number) => toastStore.dismiss(id)
};
