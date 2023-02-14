
export function selectUser(global, userId) {
	return global.users[userId] || undefined;
}

export function selectCurrentUser(global) {
	return selectUser(global, global.currentUserId);
}