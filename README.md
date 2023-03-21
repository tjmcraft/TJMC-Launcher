# TJMC-Launcher
<p align="center">
  <img alt="TJMC-Launcher White" src="assets/tjmc-launcher-w.png" width="400">
  <img alt="TJMC-Launcher Black" src="assets/tjmc-launcher-b.png" width="400">
</p>

## About project
This project was originally created by [MakAndJo](https://github.com/MakAndJo) and then moved to `TJMC-Company`. (for *non-commercial purpose* only) \
TJMC-Launcher is a simple to use, extremely fast, and well supported app, that allows you to install **pure** and **modded** versions of **Java Minecraft**.

## Download
If you are looking to install **TJMC-Launcher** without setting up a development environment, you can consume our binary [releases](https://github.com/tjmcraft/TJMC-Launcher/releases).

## Developing

### Downloading the source code:

Clone the repository with `git`:

```shell
git clone https://github.com/tjmcraft/TJMC-Launcher
cd TJMC-Launcher
```

To update the source code to the latest commit, run the following command inside the `TJMC-Launcher` directory:

```shell
git fetch
git pull
```

### Available Scripts:
`npm run start` - Runs the app in the normal mode \
`npm run build` - Build electron app with default config \
`npm run build:win` - Build electron app for windows only \
`npm run build:mac` - Build electron app for darwin only \
`npm run build:linux` - Build electron app for linux only \
`npm run build:linux-snap` - Build electron app for linux for snap store \
`npm run serve-render:dev` - Serve UI on dedicated server \
`npm run watch-render:dev` - Start watching UI in dev mode for dist build \
`npm run build-render:dev` - Build UI in dev mode for dist build \
`npm run build-render:prod` - Build UI in production mode for dist build \
`npm run deploy` - Build and publish electron app with default config \
`npm run deploy:win` - Build and publish electron app only for windows \
`npm run deploy:mac` - Build and publish electron app only for darwin \
`npm run deploy:linux` - Build and publish electron app only for linux \
`npm run deploy:linux-snap` - Build and publish electron app for linux and publish to snap store \
`npm run deploy:multi` - Build and publish electron app for all available platforms

## Libraries

### Used libraries for host:
 - **[electron](https://github.com/electron/electron)**
 - **[electron-builder](https://github.com/electron-userland/electron-builder)**
 - **[adm-zip](https://github.com/cthackers/adm-zip)**
 - **[fs-extra](https://github.com/jprichardson/node-fs-extra)**
 - **[got](https://github.com/sindresorhus/got)**
 - **[md5](https://github.com/pvorb/node-md5)**
 - **[request](https://github.com/request/request)**
 - **[ws](https://github.com/websockets/ws)**

 ## License
 All code are licensed under [MIT Licence](https://github.com/tjmcraft/TJMC-Launcher/blob/main/LICENSE)
