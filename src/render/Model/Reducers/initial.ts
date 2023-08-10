export function updateConnectionState(global, update) {
	const { connectionState } = update;
	if (connectionState == global.hostConnectionState) return;
	return {
		...global,
		hostConnectionState: connectionState,
	};
}

export function updateAuthState(global, update) {
	const { auth_state } = update;
	return {
		...global,
		auth_state: auth_state,
		authIsLoading: auth_state == 'handleCode',
	};
}

export function updateAuthError(global, update) {
	return {
		...global,
		authError: update.message,
		authIsLoading: false,
	};
}