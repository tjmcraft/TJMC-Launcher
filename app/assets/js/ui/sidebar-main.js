import { VersionChooser } from '../versionChooser.js';
import { SVG } from '../scripts/svg.js';
import { tooltip } from '../scripts/tooltip.js';
import { getConfig, getInstallations } from '../scripts/Tools.js';
import { Guilds } from '../ui/guilds.js';
import { Button, userPanel } from '../panel.js';
import { processDots, progressBar } from './round-progress-bar.js';

export var Installations
export var currentVersion


class TopToolbar {
    constructor(title = '', subtitle = '') {
        this.title = cE('h2');
        this.subtitle = cE('h5');
        this.update(title, subtitle);
        this.create();
    }
    create() {
        this.root = cE('div', { class: 'top-toolbar' },
            cE('div', { style: "width: 100%" },
                this.title, this.subtitle
            ),
            Button({ id: 'playButton', 'data-tooltip': 'Играть' }, "Играть")
        );
    }
    update(title = '', subtitle = '') {
        this.title.innerText = title || 'Федя лох';
        this.subtitle.innerText = subtitle || 'Просто конченый полупидор';
    }
    get content() {
        return this.root;
    }
}

class TopContainer {
    constructor() {
        this.toolbar = new TopToolbar();
        this.create();
    }
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
    }
    get content() {
        return this.root;
    }
}
var topContainer = new TopContainer();

class MainBase {
    constructor(sidebar, main_content) {
        this.sidebar = sidebar;
        this.main_content = main_content;
        this.create();
    }
    create() {
        this.root = cE('div', { class: 'container' },
            new Guilds().content,
            cE('div', { id: 'main', class: 'base' },
                cE('div', { class: 'sidebar-main' }, ...this.sidebar),
                cE('div', { class: 'main-content' }, ...this.main_content)
            )
        );
    }
    get content() {
        return this.root;
    }
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
            this.selectVersion(item);
            if (typeof click === 'function') click.call(this, item, e);
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
    selectVersion(version_hash) {
        let items = this.root_content.qsla('.item');
        items.forEach(e => {
            e.classList[e.getAttribute('version-hash') === version_hash ? 'add' : 'remove']('selected')
        });
    };
    removeAll() {
        this.removeFirstPage();
        this.root_content.qsla('.item').forEach(e => e.remove());
    };
}

export var sidebar_el = new SidebarMain();

export async function refreshVersions() {
    Installations = await getInstallations();
    const installations_entries = Object.entries(Installations);
    sidebar_el.removeAll();
    if (installations_entries.length > 0) {
        for (const [hash, params] of installations_entries) {
            sidebar_el.addItem({
                hash: hash,
                ...params
            }, (item) => {
                selectVersion(item.hash);
            });
        }
    } else {
        sidebar_el.createFirstPage();
    }

    if (localStorage.version_hash && Object(Installations).hasOwnProperty(localStorage.version_hash)) {
        renderSelectVersion(localStorage.version_hash)
    } else if (installations_entries[0] && installations_entries[0][0]) {
        selectVersion(installations_entries[0][0])
    } else false
}

export function selectVersion(version_hash) {
    if (!version_hash) return false;
    localStorage.version_hash = version_hash;
    renderSelectVersion(version_hash);
}

async function renderSelectVersion(version_hash = null) {
    if (!version_hash || version_hash == null || typeof version_hash !== 'string') return false;
    currentVersion = version_hash;
    const version = await getInstallation(version_hash);
    sidebar_el.selectVersion(version_hash);
    topContainer.toolbar.update(version.name || version.hash, version.type);
}

async function getInstallation(version_hash) {
    if (Installations && Object(Installations).hasOwnProperty(version_hash)) {
        return {
            hash: version_hash,
            ...Installations[version_hash]
        } || null;
    }
}

export async function MainContainer(props) {
    const config = await getConfig();
    const user_panel = new userPanel(config.auth);
    const root = new MainBase(
        [
            cE('nav', { class: 'localVersions' }, sidebar_el.content()),
            user_panel
        ], 
        [
            topContainer.root
        ]
    )
    return root;
}