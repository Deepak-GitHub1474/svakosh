class AuthState {
	isAuthenticated = $state(false);

	login() {
		this.isAuthenticated = true;
	}

	logout() {
		this.isAuthenticated = false;
	}
}

export const authState = new AuthState();
