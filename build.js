const builder = require('electron-builder')
const Platform = builder.Platform

function getCurrentPlatform(){
    switch(process.platform){
        case 'win32':
            return Platform.WINDOWS
        case 'darwin':
            return Platform.MAC
        case 'linux':
            return Platform.linux
        default:
            console.error('Cannot resolve current platform!')
            return undefined
    }
}

builder.build({
    targets: (process.argv[2] != null && Platform[process.argv[2]] != null ? Platform[process.argv[2]] : getCurrentPlatform()).createTarget(),
    config: {
        appId: 'tjmc.launcher',
        productName: 'TJMC-Launcher',
        artifactName: '${productName}-setup-${version}.${ext}',
        copyright: 'Copyright © 2020-2021 MakAndJo',
        directories: {
            buildResources: 'build',
            output: 'dist'
        },
        win: {
            publisherName: "MakAndJo",
            target: "nsis"
        },
        mac: {
            target: 'dmg',
            category: 'public.app-category.games',
            icon: 'icon.icns'
        },
        linux: {
            target: 'AppImage',
            maintainer: 'MakAndJo',
            vendor: 'MakAndJo',
            synopsis: 'TJMC Minecraft Launcher',
            description: 'Our custom minecraft launcher which contains Vanilla, OptiFine, Forge, ForgeOptiFine and other cool versions in one app',
            category: 'Game'
        },
        nsis: {
            oneClick: true,
            perMachine: false,
            allowElevation: true,
            allowToChangeInstallationDirectory: false,
            createDesktopShortcut: true,
            createStartMenuShortcut: true,
            license: "",
            installerIcon: 'icon.ico',
            installerSidebar: "",
            installerHeader: "",
            installerHeaderIcon: "",
            uninstallDisplayName: "",
            uninstallerIcon: "",
            uninstallerSidebar: "",
            deleteAppDataOnUninstall: false
        },
        dmg: {
            background: "",
            icon: "icon.icns",
            title: "Welcome to TJMC"
        },
        compression: 'maximum',
        files: [
            '!{dist,.gitignore,.vscode,docs,dev-app-update.yml,.travis.yml,.nvmrc,.eslintrc.json,build.js}'
        ],
        extraResources: [
            'libraries'
        ],
        asar: true
    }
}).then(() => {
    console.log('Build complete!')
}).catch(err => {
    console.error('Error during build!', err)
})