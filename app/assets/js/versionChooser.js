class VersionChooser {
    el = [];
    carousel;
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

        this.alertex = new AlertEx({ header: 'Добавление версии' },
            createElement('div', { class: 'inner-container'}, this.Base, this.tools)
        )
        this.el.sidebar = this.alertex.content.qsl('#version-list .sidebar')
    }
    destroy() {
        this.escBinder.uibind()
        this.alertex.destroy()
    }
    refreshVersions() {
        API.VersionManager.getGlobalVersions().then((parsed) => {
            this.el.sidebar.removeAllChildNodes()
            for (const cv in parsed) {
                this.addItem(parsed[cv])
            }
        })
    }
    addItem(item) {
        let c = this.el.sidebar
        let i = createElement('div', {class: 'item navItem'})
        i.setAttribute('version-id', item.id)
        i.innerHTML = item.id
        i.onclick = function(e) { }
        c.append(i)
    }
    remItem(item) {
        let c = this.el.sidebar
        let i = c.qsl(`[version-id=${item.id}]`)
        c.removeChild(i)
    }

    get Base() {
        const root = createElement('div', { class: 'container', id: 'version-selector' },
            createElement('div', { class: 'sidebar-main', id: 'version-list' },
                this.dropdown,
                createElement('div', { class: 'sidebar-region' }, this.sidebar)
            ),
            createElement('div', { class: 'base', id: 'main' },
                this.mainContent
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
        }
        return dropdowm_selector;
    }

    get mainContent() {
        const next_button = createElement('button', { class: 'primary-button' }, 'Далее');
        next_button.onclick = () => {

        }
        const header = createElement('h2', null, 'Выберите тип версии');
        const release_button = createElement('button', { 'data-type': 'release' }, 'Release')
        const snapshot_button = createElement('button', { 'data-type': 'snapshot' }, 'Snapshot')
        const modified_button = createElement('button', { 'data-type': 'modified' }, 'Modified')
        const old_beta_button = createElement('button', { 'data-type': 'old_beta' }, 'Beta')
        const old_alpha_button = createElement('button', { 'data-type': 'old_alpha' }, 'Alpha')
        const root_flex = createElement('div', { class: 'VT-flex-box' }, release_button, snapshot_button, modified_button, old_beta_button, old_alpha_button)
        root_flex.onclick = (e) => {
            let type = e.target?.dataset?.type;
            if (type && type !== 'undefined' && type !== null) {
                console.debug(type)
                this.selected_props.type = type;
            }
        }
        const root_content = createElement('div', { class: 'main-content' },
            header,
            createElement('div', { class: 'divider separator' }),
            root_flex,
            createElement('div', { class: 'divider separator' }),
            next_button
        );
        return root_content;
    }
}