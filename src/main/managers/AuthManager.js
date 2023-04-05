const EventEmitter = require('node:events');
const { downloadFile, postBody } = require('../util/download');
const ConfigManager = require('./ConfigManager');
const keytar = require('keytar');

const KEYTAR_KEY = 'ru.tjmc.launcher.auth';

class AuthManager extends EventEmitter {

	constructor() {
		super();
	}

	load = async () => {
		const username = ConfigManager.getOption('currentUser');
		const storedToken = JSON.parse(await keytar.getPassword(KEYTAR_KEY, username));
		if (storedToken) {
			this.token = storedToken.accessToken;
		}
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
			try {
				ConfigManager.setOption('currentUser', user.realname);
				keytar.setPassword(KEYTAR_KEY, user.realname, JSON.stringify({
					accessToken: response.accessToken,
					accessTokenExpiresAt: response.accessTokenExpiresAt,
					refreshToken: response.refreshToken,
					refreshTokenExpiresAt: response.refreshTokenExpiresAt,
					scope: response.scope,
					user: { id: response.user.id },
				}));
			} catch (e) {}
			if (user?.id) {
				this.emit('user-switch', {
					user: user
				});
			}
		}

	}

};

module.exports = new AuthManager();