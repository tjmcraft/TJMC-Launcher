

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

	const { currentUser } = update;

	return {
		...replaceUsers(global, {
			...global.users,
			[currentUser.id]: currentUser
		}),
		currentUserId: currentUser.id,
	};

}