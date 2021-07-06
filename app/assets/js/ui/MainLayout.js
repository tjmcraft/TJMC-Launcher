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
        this.MainContent = main_content;
        this.create();
        this.update();
    }
    create() {
        this.root = cE('div', { id: 'main', class: 'base', 'data-id': this.id },
            cE('div', {class: 'content'},
                cE('div', { class: 'sidebar-main' }, 
                    cE('nav', { class: 'container-3Wc7' }, ...this.sideBar), 
                    this.userPanel.content
                ),
                cE('div', { class: 'main-content' }, ...this.MainContent)
            )
        );
    }
    get content() {
        return this.root;
    }
    update(props) {}
    destroy() {}
}

export class MainBase {
    constructor(mainContainer = null) {
        this.guilds = new Guilds();
        this.create();
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
}

export class userPanel {
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