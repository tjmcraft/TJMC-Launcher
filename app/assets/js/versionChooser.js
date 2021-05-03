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
        
        const header = createElement('section', { class: 'VT-header'},
            createElement('h2', null, props?.version?.id ? `Создание установки версии ${props.version.id}` : 'Создание установки'),
            createElement('div', { class: 'full separator' })
        );
        const root_flex = createElement('div', { class: 'VT-flex-box' },
            createElement('div', { class: 'children-zx1'},
                createElement('label', { class: '', for: 'name'}, 'Название'),
                createElement('input', { class: '', type: 'text', id: 'name', name: 'name', placeholder: props?.version?.id ? `Версия ${props.version.id}` : 'без имени' })
            ),
            createElement('div', { class: 'children-zx1'},
                createElement('label', { class: '', for: 'name'}, 'Папка игры'),
                createElement('input', { class: '', type: 'file', id: 'name', name: 'name', placeholder: '<папка по умолчанию>', webkitdirectory: true })
            )
        )
        const cancel_button = createElement('button', { class: '' }, 'Отмена')
        cancel_button.onclick = () => {this.alertex.destroy()}
        const accept_button = createElement('button', { class: 'primary-button' }, 'Создать')
        accept_button.onclick = () => {
            this.addVersion(props.version.id)
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

    addVersion(version) {
        API.VersionManager.getVersionManifest(version)
    }
}