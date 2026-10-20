export class UIState {
	isWatchlistVisible = $state(false);
	isSidebarCollapsed = $derived(this.isWatchlistVisible);
	isMobileMenuOpen = $state(false);
	isLogoutConfirmOpen = $state(false);

	toggleWatchlist() {
		this.isWatchlistVisible = !this.isWatchlistVisible;
	}

	toggleMobileMenu() {
		this.isMobileMenuOpen = !this.isMobileMenuOpen;
	}
}

export const uiState = new UIState();
