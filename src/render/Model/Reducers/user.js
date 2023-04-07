

function replaceUsers(global, newUsers) {
	return {
		...global,
		users: {
			...global.users,
			...newUsers
		}
	};
}

export function updateUser(global, userId, userUpdate) {
	return replaceUsers(global, {
		...global.users,
		[userId]: userUpdate
	});
}

export function updateCurrentUser(global, update) {

	const { user } = update;

	if (user) {
		return {
			...global,
			...replaceUsers(global, {
				...global.users,
				[user.id]: user
			}),
			currentUserId: user.id,
			auth_state: 'ready',
			authIsLoading: false,
		};
	}

	return {
		...global,
		currentUserId: undefined,
		auth_state: 'need_auth',
		authIsLoading: false,
	};
}