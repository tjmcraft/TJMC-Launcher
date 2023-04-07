const Config = require('../libs/Config');
const keytar = require('keytar');
const EventEmitter = require('node:events');
const { downloadFile, postBody } = require('../util/download');
const { getOfflineUUID, buildUrl } = require('../util/Tools');
const { randomString } = require('../util/Random');
const { launcherDir } = require('../Paths');

const KEYTAR_KEY = 'ru.tjmc.launcher.auth';

const config = new Config({
	prefix: "AuthConfig",
	color: "#a0a255",
	configName: 'auth-config.json',
	configDir: launcherDir,
	defaultConfig: Object.seal({
		currentUserId: "",
		users: [],
	})
});

class AuthManager extends EventEmitter {

	/**
	 * Current user identifier
	 * @type {string}
	 */
	currentUserId = undefined;

	/**
	 * Current access token
	 * @type {string}
	 */
	token = undefined;

	constructor() {
		super();
		config.load();
	}

	matchUserId = (user) => {
		const match = /(?<group>\w+)\/(?<username>.+)/i.exec(user).slice(1);
		return Object.seal({ type: match[0], username: match[1] });
	}
	createUserId = (type = 'offline', username) => `${type}/${username}`;

	load = async () => {
		this.currentUserId = config.getOption('currentUserId');
		if (!this.currentUserId) return;
		let storedToken;
		try {
			const keytarMatch = await keytar.getPassword(KEYTAR_KEY, this.currentUserId);
			storedToken = JSON.parse(keytarMatch);
		} catch (e) {}
		if (!storedToken) return;
		if (this.matchUserId(this.currentUserId)['type'] == 'tjmc') {
			this.token = storedToken.accessToken;
		}
	}

	getCurrentUser = async (token = undefined) => {
		if (this.currentUserId && this.matchUserId(this.currentUserId)['type'] == 'offline') {
			return this.createMockedOfflineUser(this.matchUserId(this.currentUserId)['username']);
		}
		token = token ?? this.token;
		if (token == void 0) return;
		const { response } = await downloadFile("https://app.tjmc.ru/api/user?access_token=" + token);
		return response.user;
	};

	createMockedOfflineUser = (username) => {
		const userId = this.createUserId('offline', username);
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
		config.setOption('currentUserId', '');
		this.currentUserId = undefined;
		this.token = undefined;
	};

	handleOfflineAuth = async (username) => {
		const user = this.createMockedOfflineUser(username);
		try {
			config.setOption('currentUserId', user.id);
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
			const userId = this.createUserId('tjmc', user.realname);
			try {
				config.setOption('currentUserId', userId);
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
			if (user?.id != undefined) {
				this.emit('user-switch', {
					user: user
				});
			}
		}

	}

};

module.exports = new AuthManager();