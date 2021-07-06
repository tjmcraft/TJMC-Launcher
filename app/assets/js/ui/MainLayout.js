// Imports
import { SVG } from "../scripts/svg.js";
import { getConfig } from "../scripts/Tools.js";
import { Settings } from "../settings.js";
import { VersionChooser } from "../versionChooser.js";
import { Guilds } from "./guilds.js";

export class Base {
    constructor(id = null, sidebar = [], main_content = []) {
        this.id = id;
        this.sideBar = sidebar;
        this.userPanel = new userPanel();
        this.MainContent = cE('div', { class: 'main-content' });
        this.create();
        this.update();
        this.updateMainContent(main_content);
    }
    create() {
        this.root = cE('div', { id: 'main', class: 'base', 'data-id': this.id },
            cE('div', {class: 'content'},
                cE('div', { class: 'sidebar-main' }, 
                    cE('nav', { class: 'container-3Wc7' }, ...this.sideBar), 
                    this.userPanel.content
                ),
                this.MainContent
            )
        );
    }
    get content() {
        return this.root;
    }
    update(props) {}
    destroy() {}
    updateMainContent(props) {
        this.MainContent.removeAllChildNodes();
        this.MainContent.append(...props);

    }
}

export class MainBase {
    constructor(guilds = null, mainContainer = null) {
        this.guilds = new Guilds();
        this.guilds.removeAll();
        this.create();
        this.updateGuilds(guilds);
        this.update(mainContainer);
    };
    create() {
        this.root = cE('div', { class: 'container' },
            this.guilds.content
        );
    };
    get content() {
        return this.root;
    };
    update(props) {
        this.root.qsla('.base').forEach(i => i.remove());
        props && this.root.append(props);
    }
    updateGuilds(guilds = null) {
        const Items = guilds || [
            {
                type: 'item',
                image: 'https://picsum.photos/48/48?h=11',
                click: () => console.log(11)
            },
            {
                type: 'item',
                image: 'https://picsum.photos/48/48?h=22',
                click: () => console.log(22)
            },
            {
                type: 'item',
                image: 'https://picsum.photos/48/48?h=11',
                click: () => {}
            },
            { type: 'separator' },
            {
                type: 'item',
                image: 'https://picsum.photos/48/48?h=11',
                click: () => {}
            }
        ];
        this.guilds.removeAll();
        this.guilds.addItems(Items);
    }
}

class userPanel {
    constructor() {
        this.avatar = cE('img');
        this.username = cE('div', { class: 'title' });
        this.permission = cE('div', { class: 'subtitle'});
        this.addVersionButton = cE('div', { class: 'button', id: 'add-version-button' }, SVG('add-plus'));
        this.addVersionButton.tooltip("Добавить версию");
        this.addVersionButton.onclick = (e) => new VersionChooser();
        this.settingsButton = cE('div', { class: 'button', id: 'settings-button' }, SVG('settings-gear'));
        this.settingsButton.tooltip("Настройки");
        this.settingsButton.onclick = (e) => new Settings();
        this.root;
        this.create();
        this.update();
    };
    create() {
        this.root = cE('div', { class: 'panel' },
            cE('div', { class: 'container' },
                cE('div', { class: 'avatar round' },
                    this.avatar
                ),
                cE('div', { class: 'nameTag' },
                    this.username, 
                    this.permission
                ), 
                this.addVersionButton, this.settingsButton
            )
        );
    };
    async update() {
        const config = await getConfig();
        this.username.innerText = config?.auth?.username || '';
        this.permission.innerText = config?.auth?.permission || '';
        this.avatar.src = `https://api.tjmcraft.ga/v1/skin.render?aa=true&ratio=20&vr=0&hr=0&headOnly=true&user=${config?.auth?.username}`;
    };
    get content() {
        return this.root;
    };
}

class Sidebar {
    constructor(props) {

    }
    create() {
        this.root = null;
    }
    addItem(item, click = () => {}) {

    }
    get content() {
        return this.root;
    }
    selectItem() {

    }
    removeItem() {

    }
    removeAll() {

    }
}