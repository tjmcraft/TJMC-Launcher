class VersionChooser {
    el = []
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
            { name: 'lol', click: function (e) { console.log(e) } },
            { name: 'kek', click: function (e) { console.log(e) } }
        ];
        const dd_elements = dropdown_items.map(i => {
            const root_item = createElement('a', null, i.name);
            root_item.onclick = i.click;
            return root_item;
        });
        const svg_element = SVG('dropdown-key');
        const dropdown = createElement('div', { class: 'dropdown hidden', id: 'dd-elements' }, ...dd_elements);
        const root_dropdown = createElement('div', { class: 'container-f', id: 'dropdown-list' },
            createElement('div', { class: 'header' },
                createElement('h1', null, 'Версии'),
                svg_element
            ),
            dropdown
        );
        root_dropdown.onclick = (e) => {
            svg_element.classList.toggle('open')
            dropdown.toggle()
        };
        return root_dropdown;
    }

    get mainContent() {
        const header = createElement('h2', null, 'text');
        const root_content = createElement('div', { class: 'main-content' }, header, createElement('div', {class: 'divider separator'}), 'text');
        return root_content;
    }
}