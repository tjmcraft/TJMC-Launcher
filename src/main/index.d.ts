import { PathLike } from "fs";

type Installation = {
	created: Date;
	icon: string;
	type: 'custom';
	gameDir: PathLike;
	versionDir: PathLike;
	mcPath: PathLike;
	javaPath: PathLike;
	javaArgs: string;
	lastUsed: Date;
	lastSync: Date;
	lastVersionId: string;
	name: string;
	resolution: {
			width: number;
			height: number;
			fullscreen: boolean;
	};
	checkHash: boolean;
	checkFiles: boolean;
	autoConnect: boolean;
}

type MinecraftOptions = {
	overrides: {
			path: {
					versions: string;
					minecraft: string;
					gameDirectory: string;
			};
	};
	mcPath: PathLike;
	installation: Installation;
	java: {
			memory: {
					min: number;
					max: number;
			};
	};
	auth: {
			access_token: object;
			uuid: object;
			username: object;
			user_properties: object;
	};
}