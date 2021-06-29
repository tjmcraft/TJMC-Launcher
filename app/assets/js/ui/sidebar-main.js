
import { VersionChooser } from '../versionChooser.js';
import { SVG } from '../scripts/svg.js';
import { tooltip } from '../scripts/tooltip.js';
import { getInstallations } from '../scripts/Tools.js';

export var Installations
export var currentVersion

class SidebarMain {
    root_scroller;
    root_content;
    root_fp;
    constructor(props) {
        this.base();
    };
    base() {
        const add_button = cE('div', {
            class: 'simple-button'
        }, SVG('add-plus'));
        add_button.onclick = (e) => new VersionChooser();
        tooltip.call(add_button, 'Добавить версию');
        //add_button.tooltip('Добавить версию');
        this.root_content = cE('div', {
                class: ['content']
            },
            cE('h2', {
                    class: ['versionsHeader', 'container-df']
                },
                cE('span', null, 'Версии'), add_button
            )
        );
        this.root_scroller = cE('div', {
                class: ['scroller', 'thin-s']
            },
            this.root_content
        );
        return this.root_scroller;
    };
    addItem(item, click = () => {}) {
        const root_item = cE('div', {
            class: 'item navItem',
            'version-hash': item.hash
        }, item.name || item.hash);
        //console.debug(item);
        root_item.addEventListener('click', (e) => {
            this.selectVersion(item)
            if (typeof click === 'function')
                click.call(this, item, e)
        })
        this.root_content.appendChild(root_item)
    };
    createFirstPage() {
        this.root_fp = cE('div', {
            class: 'item centred fp'
        }, cE('h1', {}, 'Добавьте версию'));
        this.root_scroller.appendChild(this.root_fp)
    };
    removeFirstPage() {
        this.root_fp && this.root_fp.remove();
    };
    removeItem(item) {
        const selected_item = this.root_content.qsl(`.item[version-hash=${item.hash}]`)
        this.root_content.removeChild(selected_item)
    };
    content(def = false) {
        return !def && this.root_scroller ? this.root_scroller : this.base();
    };
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
    qsl('.localVersions').append(sidebar_el.content());

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
    let m = qsl('.top-toolbar'),
        n = m.qsl('h2'),
        d = m.qsl('h5');
    sidebar_el.selectVersion(version_hash);
    n.innerText = version.name || version.hash;
    d.innerText = version.type;
}

async function getInstallation(version_hash) {
    if (Installations && Object(Installations).hasOwnProperty(version_hash)) {
        return {
            hash: version_hash,
            ...Installations[version_hash]
        } || null;
    }
}

var sidebar_el = new SidebarMain();