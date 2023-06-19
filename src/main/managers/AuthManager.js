const Config = require('../libs/Config');
const keytar = require('keytar');
const EventEmitter = require('node:events');
const { downloadFile, postBody } = require('../util/download');
const { getOfflineUUID, buildUrl } = require('../util/Tools');
const { randomString } = require('../util/Random');
const { launcherDir } = require('../Paths');

const API_HOST = "https://api.tjmc.ru/v2/";
const OAUTH_HOST = "https://oauth.tjmc.ru/";
const CLIENT_ID = "1";
const CLIENT_SECRET = "client1.secret";
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
	 * @typedef TJMCToken
	 * @type {object}
	 * @property {string} type Auth type
	 * @property {string} accessToken Access token
	 * @property {string} accessTokenExpiresAt Access token expiry date
	 * @property {string} refreshToken Refresh token
	 * @property {string} refreshTokenExpiresAt Refresh token date
	 * @property {string} scope Auth scope
	 * @property {object} user Auth user object
	 * @property {number} user.id User id
	 * @property {string} user.username User realname
	 */

	/**
	 * Current token
	 * @type {TJMCToken}
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

	/**
	 * Create discriminator for offline user
	 * @param {string} username
	 */
	createOfflineDiscriminator = (username) => {
		const codes = username.split('').map(letter => letter.charCodeAt(0) * 3);
		return codes.reduce((t, c) => t + c, 0);
	}

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
			this.token = storedToken;
		}
	}

	getCurrentUser = async (token = undefined, try_refresh = true) => {
		if (this.currentUserId && this.matchUserId(this.currentUserId)['type'] == 'offline') {
			return this.createMockedOfflineUser(this.matchUserId(this.currentUserId)['username']);
		}
		token = token ?? this.token;
		if (token == void 0) return;
		const { response } = await downloadFile(API_HOST + "user?access_token=" + token.accessToken);
		if (response?.user == undefined) {
			if (try_refresh) {
				this.token = undefined;
				return await this.handleRefreshToken(token.refreshToken);
			}
			this.logoutCurrentUser();
			return undefined;
		}
		console.debug('[currentUser]', response.user);
		return response.user;
	};

	getCurrentUserName = async () => {
		return this.matchUserId(this.currentUserId)['username'] ?? undefined;
	}

	createMockedOfflineUser = (username) => {
		const userId = this.createUserId('offline', username);
		const user = {
			username: username,
			realname: username,
			"id": userId,
			"avatar": undefined,
			"email": undefined,
			"discriminator": this.createOfflineDiscriminator(userId),
			"public_flags": "0",
			"balance": 0,
			"uuid": getOfflineUUID(username),
			"permission": "offline",
			"permission_display_name": "Offline"
		};
		return user;
	}

	revokeAuth = async (userId) => {

	};

	logoutCurrentUser = async () => {
		if (!this.currentUserId) return;
		console.debug('[logout]', this.currentUserId);
		await keytar.deletePassword(KEYTAR_KEY, this.currentUserId);
		config.setOption('currentUserId', '');
		this.currentUserId = undefined;
		this.token = undefined;
	};

	handleOfflineAuth = async (username) => {
		const user = this.createMockedOfflineUser(username);
		try {
			config.setOption('currentUserId', user.id);
			this.currentUserId = user.id;
		} catch (e) {}
		if (user?.id) {
			this.emit('user-switch', {
				user: user
			});
		}
	}

	handleTJMCAuth = () => {
		return buildUrl(OAUTH_HOST + "authorize", {
			response_type: 'code',
			client_id: CLIENT_ID,
			scope: 'read,write',
			redirect_uri: 'tjmc://authorize',
			state: randomString(8),
		});
	}

	handleCode = async (code) => {
		this.emit('handle-code');
		console.debug(">>", "handleCode");
		const response = await postBody(OAUTH_HOST + "token", {
			grant_type: 'authorization_code',
			client_id: CLIENT_ID,
			client_secret: CLIENT_SECRET,
			code: code,
		});
		console.debug(">>", response);
		if (response.accessToken) {
			await this.handleTokenResponse(response, false);
		}
	}

	handleRefreshToken = async (refreshToken) => {
		this.emit('handle-refresh');
		console.debug(">>", "handleRefreshToken");
		const response = await postBody(OAUTH_HOST + "token", {
			grant_type: 'refresh_token',
			client_id: CLIENT_ID,
			client_secret: CLIENT_SECRET,
			refresh_token: refreshToken,
		});
		console.debug(">>", response);
		if (response.accessToken) {
			return await this.handleTokenResponse(response, true);
		}
	}

	handleTokenResponse = async (response, silent = true) => {
		if (response.accessToken) {
			const user = await this.getCurrentUser(response);
			const userId = this.createUserId('tjmc', user.realname);
			try {
				/**
				 * @type {TJMCToken}
				 */
				const token = {
					type: 'tjmc.auth',
					accessToken: response.accessToken,
					accessTokenExpiresAt: response.accessTokenExpiresAt,
					refreshToken: response.refreshToken,
					refreshTokenExpiresAt: response.refreshTokenExpiresAt,
					scope: response.scope,
					user: { id: response.user.id, username: user.realname },
				};
				config.setOption('currentUserId', userId);
				this.currentUserId = userId;
				keytar.setPassword(KEYTAR_KEY, userId, JSON.stringify(token));
				this.token = token;
			} catch (e) {}
			if (!silent && user?.id != undefined) {
				this.emit('user-switch', {
					user: user
				});
			}
			return user;
		}
	};

};

module.exports = new AuthManager();