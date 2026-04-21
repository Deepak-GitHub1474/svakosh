export class UIState {
	isWatchlistVisible = $state(false);
	isSidebarCollapsed = $derived(this.isWatchlistVisible);

	toggleWatchlist() {
		this.isWatchlistVisible = !this.isWatchlistVisible;
	}
}

export const uiState = new UIState();
