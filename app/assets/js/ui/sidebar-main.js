import { VersionChooser } from '../versionChooser.js';
import { SVG } from '../scripts/svg.js';
import { tooltip } from '../scripts/tooltip.js';
import { getConfig, getInstallations } from '../scripts/Tools.js';
import { Guilds } from '../ui/guilds.js';
import { Button } from '../panel.js';
import { processDots, progressBar } from './round-progress-bar.js';
import { Settings } from '../settings.js';

export var Installations
export var currentVersion

class TopToolbar {
    constructor(title = '', subtitle = '') {
        this.title = cE('h2');
        this.subtitle = cE('h5');
        this.update(title, subtitle);
        this.create();
    };
    create() {
        this.root = cE('div', { class: 'top-toolbar' },
            cE('div', { style: "width: 100%" },
                this.title, this.subtitle
            ),
            Button({ id: 'playButton', 'data-tooltip': 'Играть' }, "Играть")
        );
    };
    update(title = '', subtitle = '') {
        this.title.innerText = title || 'Федя лох';
        this.subtitle.innerText = subtitle || 'Просто конченый полупидор';
    };
    get content() {
        return this.root;
    };
}

class TopContainer {
    constructor(props) {
        this.toolbar = new TopToolbar();
        this.create();
    };
    create() {
        this.root = cE('div', { class: 'top' },
            cE('img', {
                src: "./assets/images/background.jpg",
                onerror: "this.src='../app/assets/images/default.png'"
            }),
            cE('div', { class: 'top-overlay' },
                this.toolbar.content
            )
        );
    };
    get content() {
        return this.root;
    };
}

class MainBase {
    constructor(sidebar, main_content) {
        this.sidebar = sidebar;
        this.main_content = main_content;
        this.create();
    };
    create() {
        this.root = cE('div', { class: 'container' },
            new Guilds().content,
            cE('div', { id: 'main', class: 'base' },
                cE('div', { class: 'sidebar-main' }, ...this.sidebar),
                cE('div', { class: 'main-content' }, ...this.main_content)
            )
        );
    };
    get content() {
        return this.root;
    };
}

class userPanel {
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

class SidebarMain {
    root_scroller;
    root_content;
    root_fp;
    vdom = {
        progress_bars: [],
        process_dots: [],
    };
    constructor(props) {
        this.base();
    };
    base() {
        const add_button = cE('div', { class: 'simple-button' }, SVG('add-plus'));
        add_button.onclick = (e) => new VersionChooser();
        tooltip.call(add_button, 'Добавить версию');
        this.root_content = cE('div', { class: ['content'] },
            cE('h2', { class: ['versionsHeader', 'container-df'] },
                cE('span', null, 'Версии'), add_button
            )
        );
        this.root_scroller = cE('div', { class: ['scroller', 'thin-s'] }, this.root_content);
        return this.root_scroller;
    };
    addItem(item, click = () => {}) {
        const progress_bar = new progressBar();
        const process_dots = new processDots();
        const root_item = cE('div', { class: 'item navItem', 'version-hash': item.hash },
            cE('span', null, item.name || item.hash),
            cE('div', { class: 'status-container' },
                process_dots.content,
                progress_bar.content
            )
        );
        root_item.onclick = (e) => {
            this.selectItem(item.hash);
            if (typeof click === 'function') click.call(this, item.hash, e);
        }
        this.vdom.progress_bars[item.hash] = progress_bar;
        this.vdom.process_dots[item.hash] = process_dots;
        this.root_content.appendChild(root_item);
    };
    createFirstPage() {
        this.root_fp = cE('div', { class: ['item', 'centred', 'fp'] }, cE('h1', {}, 'Добавьте версию'));
        this.root_scroller.appendChild(this.root_fp)
    };
    removeFirstPage() {
        this.root_fp && this.root_fp.remove();
    };
    selectItem(version_hash) {
        let items = this.root_content.qsla('.item');
        items.forEach(e => {
            e.classList[e.getAttribute('version-hash') === version_hash ? 'add' : 'remove']('selected')
        });
    };
    removeItem(item) {
        const selected_item = this.root_content.qsl(`.item[version-hash=${item.hash}]`);
        this.root_content.removeChild(selected_item);
        delete this.vdom.progress_bars[version_hash];
        delete this.vdom.process_dots[version_hash];
    };
    content(def = false) {
        return !def && this.root_scroller ? this.root_scroller : this.base();
    };
    progressBars() {
        return this.vdom.progress_bars;
    };
    processDots() {
        return this.vdom.process_dots;
    }
    removeAll() {
        this.removeFirstPage();
        this.root_content.qsla('.item').forEach(e => e.remove());
    };
}

export class MainContainer {
    constructor(props) {
        const config = props?.config;
        this.sideBar = new SidebarMain();
        this.userPanel = new userPanel(config?.auth?.username, config?.auth?.permission);
        this.topContainer = new TopContainer();
        this.create();
        this.refreshVersions();
    };
    create() {
        this.root = new MainBase(
            [
                cE('nav', { class: 'localVersions' }, this.sideBar.content()),
                this.userPanel.content
            ],
            [
                this.topContainer.content
            ]
        ).content;
    };
    get content() {
        return this.root;
    };
    async refreshVersions() {
        Installations = await getInstallations();
        const installations_entries = Object.entries(Installations);
        this.sideBar.removeAll();
        if (installations_entries.length > 0) {
            for (const [hash, params] of installations_entries) {
                this.sideBar.addItem({hash: hash, ...params}, item => this.selectVersion(item));
            }
        } else { this.sideBar.createFirstPage(); }
        if (localStorage.version_hash && Object(Installations).hasOwnProperty(localStorage.version_hash)) {
            this.renderSelectVersion(localStorage.version_hash)
        } else if (installations_entries[0] && installations_entries[0][0]) {
            this.selectVersion(installations_entries[0][0])
        } else false
    };
    async selectVersion(version_hash) {
        if (!version_hash || version_hash == null || typeof version_hash !== 'string') return false;
        currentVersion = version_hash; localStorage.version_hash = version_hash; this.renderSelectVersion(version_hash);
    };
    async renderSelectVersion(version_hash) {
        if (!version_hash || version_hash == null || typeof version_hash !== 'string') return false;
        const version = await getInstallation(version_hash);
        this.sideBar.selectItem(version_hash); this.topContainer.toolbar.update(version.name || version.hash, version.type);
    };
}



/* ================================================================= */

async function getInstallation(version_hash) {
    if (Installations && Object(Installations).hasOwnProperty(version_hash)) 
        return { hash: version_hash, ...Installations[version_hash] } || null;
}