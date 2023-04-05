const EventEmitter = require('node:events');
const { downloadFile, postBody } = require('../util/download');

class AuthManager extends EventEmitter {

	constructor() {
		super();
	}

	getCurrentUser = async (token = undefined) => {
		token = token ?? this.token;
		if (token == void 0) return;
		const { response } = await downloadFile("https://app.tjmc.ru/api/user?access_token=" + token);
		return response.user;
	};

	token = undefined;

	handleCode = async (code) => {

		const response = await postBody("https://oauth.tjmc.ru/token", {
			grant_type: 'authorization_code',
			client_id: 1,
			client_secret: 'client1.secret',
			code: code,
		});

		console.debug(">>", response);

		if (response.accessToken) {
			this.token = response.accessToken;
			const user = await this.getCurrentUser();
			if (user?.id) {
				this.emit('user-switch', {
					user: user
				});
			}
		}

	}

};

module.exports = new AuthManager();