const EventEmitter = require('node:events');
const { downloadFile, postBody } = require('../util/download');
const ConfigManager = require('./ConfigManager');
const keytar = require('keytar');

const KEYTAR_KEY = 'ru.tjmc.launcher.auth';

class AuthManager extends EventEmitter {

	constructor() {
		super();
	}

	token = undefined;

	load = async () => {
		const username = ConfigManager.getOption('currentUser');
		if (username) {
			const storedToken = JSON.parse(await keytar.getPassword(KEYTAR_KEY, username));
			if (storedToken) {
				this.token = storedToken.accessToken;
			}
		}
	}

	getCurrentUser = async (token = undefined) => {
		token = token ?? this.token;
		if (token == void 0) return;
		const { response } = await downloadFile("https://app.tjmc.ru/api/user?access_token=" + token);
		return response.user;
	};

	revokeAuth = async (userId) => {

	};

	logoutCurrentUser = async () => {
		ConfigManager.setOption('currentUser', '');
		this.token = undefined;
	};

	handleOfflineAuth = async (username) => {
		const user = {
			username: username,
			realname: username,
			"id": "offline.1",
			"avatar": undefined,
			"email": undefined,
			"discriminator": 1613,
			"public_flags": "0",
			"balance": 0,
			"uuid": "130ef346-8ed3-3c92-8783-01c0a3aea9d8",
			"permission": "default",
			"permission_display_name": "Default"
		};
		try {
			ConfigManager.setOption('currentUser', user.realname);
			keytar.setPassword(KEYTAR_KEY, user.realname, JSON.stringify({
				type: 'tjmc.auth',
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
					type: 'tjmc.auth',
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