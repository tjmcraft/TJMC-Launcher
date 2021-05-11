class VersionChooser {
    el = [];
    selected_props = [];
    constructor() {
        this.tools = createToolsContainer(() => {
            this.destroy()
        })

        this.escBinder = new escBinder()
        this.escBinder.bind(() => {
            this.destroy()
        })

        this.refreshVersions()

        this.alertex = new AlertEx({  },
            createElement('div', { class: 'inner-container'}, this.Base, this.tools)
        )
        this.el.sidebar = this.alertex.content.qsl('#version-list .sidebar')
    }
    destroy() {
        this.escBinder.uibind()
        this.alertex.destroy()
    }
    refreshVersions(type = 'all') {
        API.VersionManager.getGlobalVersions().then((parsed) => {
            this.el.sidebar.removeAllChildNodes()
            let versions = parsed.filter((i) => {return type == 'all' ? true : i.type == type })
            for (const version of versions) {
                this.addItem(version)
            }
        })
    }
    addItem(item) {
        let c = this.el.sidebar
        let i = createElement('div', {class: 'item navItem'})
        i.setAttribute('version-id', item.id)
        i.innerHTML = item.id
        i.onclick = (e) => {
            this.renderVersion(item)
        }
        c.append(i)
    }
    remItem(item) {
        let c = this.el.sidebar
        let i = c.qsl(`[version-id=${item.id}]`)
        c.removeChild(i)
    }

    get Base() {
        this.main_content = this.createFisrtPage()
        const root = createElement('div', { class: 'container', id: 'version-selector' },
            createElement('div', { class: 'sidebar-main', id: 'version-list' },
                this.dropdown,
                createElement('div', { class: 'sidebar-region' }, this.sidebar)
            ),
            createElement('div', { class: 'base', id: 'main' },
                this.main_content
            )
        )
        return root;
    }

    get sidebar() {
        const sidebar_items = [
            { type: 'navItem bgL' },
            { type: 'navItem bgL' },
            { type: 'navItem bgL' },
            { type: 'navItem bgL' },
            { type: 'navItem bgL' },
            { type: 'navItem bgL' }
        ];
        const items = sidebar_items.map(i => {
            const root_item = createElement('div', { class: 'item' + (i.type ? ' ' + i.type : '') });
            return root_item;
        });
        const root_sidebar = createElement('div', { class: 'sidebar' }, ...items);
        return root_sidebar;
    }

    get dropdown() {
        const dropdown_items = [
            { name: 'Release', type: 'release' },
            { name: 'Snapshot', type: 'snapshot' },
            { name: 'Modified', type: 'modified' },
            { name: 'Beta', type: 'old_beta' },
            { name: 'Alpha', type: 'old_alpha' },
        ];
        const dropdown = new DropdownSelector();
        const dropdowm_selector = dropdown.createSelector(dropdown_items);
        dropdown.onselect = (item) => {
            console.log(item)
            this.refreshVersions(item.type)
        }
        return dropdowm_selector;
    }

    createFisrtPage(props) {
        const root_content = createElement('div', { class: 'main-content centred' }, createElement('h1', null, 'Выберите версию'))
        return root_content;
    }

    createMainContent(props) {
        let work_dir = null;
        let version_name = null;
        const header = createElement('section', { class: 'VT-header'},
            createElement('h2', null, props?.version?.id ? `Создание установки версии ${props.version.id}` : 'Создание установки'),
            createElement('div', { class: 'full separator' })
        );
        /* ===== */
        const input_path = new Input({ type: 'path' });
        input_path.onchange = (e, path, files) => work_dir = path;
        const file_input = input_path.create({ placeholder: '<папка по умолчанию>', button_name: 'Обзор' });
        /* ===== */
        const input_text = new Input({ type: 'text' });
        input_text.onchange = (e, value) => version_name = value;
        const name_input = input_text.create({ placeholder: props?.version?.id ? `Версия ${props.version.id}` : 'без имени' });
        /* ===== */
        const root_flex = createElement('div', { class: 'VT-flex-box' },
            createElement('div', { class: 'children-zx1' },
                createElement('label', { class: '', for: 'name' }, 'Название'),
                name_input
            ),
            createElement('div', { class: 'children-zx1' },
                createElement('label', { class: '', for: 'name'}, 'Папка игры'),
                file_input
            )
        )
        const cancel_button = createElement('button', { class: '' }, 'Отмена')
        cancel_button.onclick = () => {this.alertex.destroy()}
        const accept_button = createElement('button', { class: 'primary-button' }, 'Создать')
        accept_button.onclick = () => {
            this.addVersion(props.version.id, version_name, work_dir).then(() => {
                refreshVersions();
                this.alertex.destroy();
            })
        }
        const footer = createElement('section', { class: 'VT-footer' },
            createElement('div', { class: 'full separator' }),
            cancel_button, accept_button
        )
        const root_content = createElement('div', { class: 'main-content' },
            header,
            root_flex,
            footer
        );
        return root_content;
    }

    renderVersion(version) {
        console.debug(version)
        const main_content = this.createMainContent({
            version: version
        })
        this.main_content.replaceWith(main_content)
        this.main_content = main_content
    }

    async addVersion(version, name, dir) {
        await API.VersionManager.createInstallation(version, name, dir);
    }
}