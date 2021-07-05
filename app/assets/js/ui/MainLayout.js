// Imports
import { SVG } from "../scripts/svg.js";
import { Settings } from "../settings.js";
import { VersionChooser } from "../versionChooser.js";
import { Guilds } from "./guilds.js";

class Base {
    constructor(id = null, sidebar, main_content) {
        this.id = id;
        this.sideBar = sidebar;
        this.MainContent = main_content;
        this.create();
        this.update();
    }
    create() {
        this.root = cE('div', { id: 'main', class: 'base', 'data-id': this.id },
            cE('div', { class: 'sidebar-main' }, ...this.sideBar),
            cE('div', { class: 'main-content' }, ...this.MainContent)
        );
    }
    get content() {
        return this.root;
    }
    update(props) {}
}

export class MainBase {
    constructor(sidebar, main_content) {
        this.guilds = new Guilds();
        this.base = new Base(null, sidebar, main_content);
        this.create();
    };
    create() {
        this.root = cE('div', { class: 'container' },
            this.guilds.content,
            this.base.content
        );
    };
    get content() {
        return this.root;
    };
}

export class userPanel {
    constructor(username = '', permission = '') {
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
        this.update(username, permission);
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
    update(username, permission) {
        this.username.innerText = username || '';
        this.permission.innerText = permission || '';
        this.avatar.src = `https://api.tjmcraft.ga/v1/skin.render?aa=true&ratio=20&vr=0&hr=0&headOnly=true&user=${username}`;
    };
    get content() {
        return this.root;
    };
}