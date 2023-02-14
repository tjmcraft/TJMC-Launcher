export function updateConnectionState(global, update) {
	const { connectionState } = update;
	if (connectionState == global.hostConnectionState) return;
	return {
		...global,
		hostConnectionState: connectionState,
	};
}

export function updateAuthState(global, update) {
	return {
		...global,
		auth_state: update.auth_state,
		authIsLoading: false,
	};
}

export function updateAuthError(global, update) {
	return {
		...global,
		authError: update.message,
		authIsLoading: false,
	};
}