const EventEmitter = require('node:events');
const { downloadFile, postBody } = require('../util/download');
const ConfigManager = require('./ConfigManager');
const keytar = require('keytar');
const { getOfflineUUID, buildUrl } = require('../util/Tools');
const { randomString } = require('../util/Random');

const KEYTAR_KEY = 'ru.tjmc.launcher.auth';

class AuthManager extends EventEmitter {

	/**
	 * Current user identifier
	 * @type {string}
	 */
	currentUserId = undefined;

	/**
	 * Current user type
	 * @type {'offline'|'tjmc'}
	 */
	currentUserType = undefined;

	/**
	 * Current user name
	 * @type {string}
	 */
	currentUserName = undefined;

	/**
	 * Current access token
	 * @type {string}
	 */
	token = undefined;

	constructor() {
		super();
		// this.currentUserType = this.currentUserId.split('/')[0];
	}

	load = async () => {
		this.currentUserId = ConfigManager.getOption('currentUser');
		if (this.currentUserId) {
			const storedToken = JSON.parse(await keytar.getPassword(KEYTAR_KEY, this.currentUserId));
			if (storedToken) {
				if (this.currentUserId.split('/')[0] == 'tjmc') {
					this.token = storedToken.accessToken;
				}
			}
		}
	}

	getCurrentUser = async (token = undefined) => {
		token = token ?? this.token;
		if (this.currentUserId && this.currentUserId.split('/')[0] == 'offline') {
			return this.createMockedOfflineUser(this.currentUserId.split('/')[1]);
		}
		if (token == void 0) return;
		const { response } = await downloadFile("https://app.tjmc.ru/api/user?access_token=" + token);
		return response.user;
	};

	createMockedOfflineUser = (username) => {
		const userId = `offline/${username}`;
		const user = {
			username: username,
			realname: username,
			"id": userId,
			"avatar": undefined,
			"email": undefined,
			"discriminator": 1613,
			"public_flags": "0",
			"balance": 0,
			"uuid": getOfflineUUID(username),
			"permission": "default",
			"permission_display_name": "Default"
		};
		return user;
	}

	revokeAuth = async (userId) => {

	};

	logoutCurrentUser = async () => {
		ConfigManager.setOption('currentUser', '');
		this.currentUserId = undefined;
		this.token = undefined;
	};

	handleOfflineAuth = async (username) => {
		const user = this.createMockedOfflineUser(username);
		try {
			ConfigManager.setOption('currentUser', user.id);
		} catch (e) {}
		if (user?.id) {
			this.emit('user-switch', {
				user: user
			});
		}
	}

	handleTJMCAuth = () => {
		return buildUrl('https://oauth.tjmc.ru/authorize', {
			response_type: 'code',
			client_id: 1,
			scope: 'read,write',
			redirect_uri: 'tjmc://authorize',
			state: randomString(8),
		});
	}

	handleCode = async (code) => {

		this.emit('handle-code');

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
			const userId = `tjmc/${user.realname}`;
			try {
				ConfigManager.setOption('currentUser', userId);
				keytar.setPassword(KEYTAR_KEY, userId, JSON.stringify({
					type: 'tjmc.auth',
					accessToken: response.accessToken,
					accessTokenExpiresAt: response.accessTokenExpiresAt,
					refreshToken: response.refreshToken,
					refreshTokenExpiresAt: response.refreshTokenExpiresAt,
					scope: response.scope,
					user: { id: response.user.id, username: user.realname },
				}));
				this.currentUserId = userId;
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