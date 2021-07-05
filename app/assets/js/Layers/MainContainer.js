
import { VersionChooser } from '../versionChooser.js';
import { SVG } from '../scripts/svg.js';
import { tooltip } from '../scripts/tooltip.js';
import { getConfig, isWeb, setProgressBar, startMinecraft, updateTheme } from '../scripts/Tools.js';
import { Button } from '../panel.js';
import { processDots, progressBar } from '../ui/round-progress-bar.js';
import { getCurrentVersionHash, getInstallation, refreshInstallations, setCurrentVersionHash } from '../scripts/Installations.js';
import { MainBase } from '../ui/MainLayout.js';
import { modal } from '../Libs/AlertEx.js';

class TopToolbar {
    constructor(title = '', subtitle = '') {
        this.title = cE('h2');
        this.subtitle = cE('h5');
        this.playButton = Button({ id: 'playButton', 'data-tooltip': 'Играть' }, "Играть");
        this.update(title, subtitle);
        this.create();
    };
    create() {
        this.root = cE('div', { class: 'top-toolbar' },
            cE('div', { style: "width: 100%" },
                this.title, this.subtitle
            ), this.playButton
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
                src: "https://picsum.photos/1920/1080?v=2",
                onerror: "this.src='./assets/images/background.jpg'"
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
        this.sideBar = new SidebarMain();
        this.topContainer = new TopContainer();
        this.mainBase = new MainBase (
            [
                this.sideBar.content()
            ],
            [
                this.topContainer.content
            ]
        );
        this.create();
        this.refreshUserPanel();
        this.refreshVersions();
    };
    create() {
        this.root = this.mainBase.content;
    };
    get content() {
        return this.root;
    };
    async refreshUserPanel() {
        const config = await getConfig();
        this.mainBase.base.userPanel.update(config?.auth?.username, config?.auth?.permission);
    };
    async refreshVersions() {
        const Installations = await refreshInstallations();
        const CurrentVersionHash = await getCurrentVersionHash();
        const installations_entries = Object.entries(Installations);
        this.sideBar.removeAll();
        if (installations_entries.length > 0) {
            for (const [hash, params] of installations_entries) {
                this.sideBar.addItem({hash: hash, ...params}, item => this.selectVersion(item));
            }
        } else { this.sideBar.createFirstPage(); }
        if (CurrentVersionHash && Object(Installations).hasOwnProperty(CurrentVersionHash)) {
            this.renderSelectVersion(CurrentVersionHash)
        } else if (installations_entries[0] && installations_entries[0][0]) {
            this.selectVersion(installations_entries[0][0])
        } else false
    };
    async selectVersion(version_hash) {
        if (!version_hash || version_hash == null || typeof version_hash !== 'string') return false;
        setCurrentVersionHash(version_hash); this.renderSelectVersion(version_hash);
    };
    async renderSelectVersion(version_hash) {
        if (!version_hash || version_hash == null || typeof version_hash !== 'string') return false;
        const version = await getInstallation(version_hash);
        this.sideBar.selectItem(version_hash); this.topContainer.toolbar.update(version.name || version.hash, version.type);
    };
    async init() {
        const progressBars = this.sideBar.progressBars(); // Progress bar s in sidebar (installations)
        const processDots = this.sideBar.processDots(); // Process dots in sidebar (installations)
        const playButton = this.topContainer.toolbar.playButton; // Play button in the top toolbar (main content)

        playButton.addEventListener("click", async (event) => { //Register new eventListener for play button click event
            const versionHash = await getCurrentVersionHash(); // Get current version hash
            processDots[versionHash].show(); // Show process dots for current version
            startMinecraft(versionHash); // Start minecraft with given version hash
        });

        document.addEventListener("versions.refresh", async (event) => {
            this.refreshVersions();
        });

        const registerEvents = await (!isWeb ? registerElectronEvents() : registerWebEvents()); // Register events handling
        if (registerEvents) { // If register success
            if (!isWeb) {
                updateTheme();
            }
        }

        // Define main events
        const Events = {
            openSettings: (data) => new Settings(), // Open settings
            startupSuccess: (data) => { // On success startup
                console.log(data);
                setProgressBar(-1);
                progressBars[data.version_hash].hide();
                setTimeout(() => processDots[data.version_hash].hide(), 1000);
            },
            startupError: (data) => { // On unsuccess startup
                console.warn(data);
                setProgressBar(-1);
                processDots[data.version_hash].hide();
                modal.alert("Что-то пошло не так...", data.error, 'error', { logType: true });
            },
            error: (data) => { // Programm error
                console.error(data);
                setProgressBar(-1);
                processDots[data.version_hash].hide();
                modal.alert("Ошибочка...", data.error, 'error', { logType: true });
            },
            progress: (data) => { // On progress
                console.log(data);
                const versionHash = data.version_hash;
                const progress = data.progress;
                if (data.progress > 0) {
                    processDots[versionHash].hide();
                    progressBars[versionHash].show();
                } else if (data.progress <= 0) {
                    progressBars[versionHash].hide();
                    processDots[versionHash].show();
                } 
                progressBars[versionHash].setPrecentage(progress * 100);
                setProgressBar(progress);
            },
            updateSystemTheme: (data) => { // On theme update
                updateTheme(data.theme);
            },
        }

        // Register electron events handling
        async function registerElectronEvents() {
            electron.on('open-settings', (e, data) => Events.openSettings(data)); // Open settings
            electron.on('startup-success', (e, data) => Events.startupSuccess(data)); // Success start event
            electron.on('startup-error', (e, data) => Events.startupError(data)); // Error while starting
            electron.on('error', (e, data) => Events.error(data)); // Programm error event
            electron.on('progress', (e, data) => Events.progress(data)); // Progress event
            electron.on('theme.update', (e, data) => Events.updateSystemTheme(data)); // Theme update event
            return true;
        }

        // Register Web events handling
        async function registerWebEvents() {
            let colorScheme = window.matchMedia('(prefers-color-scheme: dark)'); // Current web color scheme
            colorScheme.addEventListener("change", () => updateTheme()); // Register new eventListener for colorScheme change
            // code here
            return true;
        }
    };
}