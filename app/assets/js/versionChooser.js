class VersionChooser {
    el = []
    constructor() {
        this.layer = new Layer({
            label: 'VERSION_SELECTOR'
        })
        
        this.layer.append(this.Base)

        this.el.sidebar = this.layer.content.qsl('#version-list .sidebar')

        this.tools = createToolsContainer(() => {
            this.destroy()
        })
        this.layer.append(this.tools)

        this.escBinder = new escBinder()
        this.escBinder.bind(() => {
            this.destroy()
        })
        this.refreshVersions()
        this.layer.show()
    }
    destroy() {
        this.escBinder.uibind()
        this.layer.destroy()
    }
    refreshVersions() {
        API.VersionManager.getGlobalVersions().then((parsed) => {
            this.el.sidebar.removeAllChildNodes()
            for (const cv in parsed) {
                this.addItem(parsed[cv])
            }
        })
        this.layer.content.qsla('#dropdown-list').forEach(el => {
            el.onclick = (e) => {
                el.qsl('.button-1w5pas').classList.toggle('open')
                el.qsl('.dropdown').toggle()
            }
        })
        this.layer.content.qsla('#dropdown-list #dd-elements a').forEach(el => {
            el.onclick = (e) => {
                console.log(el.innerHTML)
            }
        })
    }
    addItem(item) {
        let c = this.el.sidebar
        let i = createElement('div', {class: 'item navItem'})
        i.setAttribute('version-id', item.id)
        i.innerHTML = item.id
        i.onclick = function() {
            //selectVersion(item)
        }
        c.append(i)
    }
    remItem(item) {
        let c = this.el.sidebar
        let i = c.qsl(`[version-id=${item.id}]`)
        c.removeChild(i)
    }

    get Base() {
        let root = createElement('div', { class: 'container', id: 'version-selector' },
            createElement('div', { class: 'sidebar-main', id: 'version-list' },
                this.dropdown,
                createElement('div', { class: 'sidebar-region' }, this.sidebar)
            ),
            createElement('div', { class: 'base', id: 'main' },
                createElement('div', { class: 'main-content'}, 'text')
            )
        )
        return root;
    }

    get sidebar() {
        let sidebar_items = [
            { type: 'navItem bgL' },
            { type: 'navItem bgL' },
            { type: 'navItem bgL' },
            { type: 'navItem bgL' },
            { type: 'navItem bgL' },
            { type: 'navItem bgL' }
        ];
        const root_sidebar = createElement('div', { class: 'sidebar' });
        sidebar_items.forEach(i => {
            let root_item = createElement('div', { class: 'item' + (i.type ? ' ' + i.type : '')} );
            root_sidebar.appendChild(root_item);
        })
        return root_sidebar;
    }

    get dropdown() {
        const root_dropdown = createElement('div', { class: 'container-f', id: 'dropdown-list' },
            createElement('div', { class: 'header' },
                createElement('h1', null, 'Версии'),
                SVG('dropdown-key')
            ),
            createElement('div', { class: 'dropdown hidden', id: 'dd-elements' },
                createElement('a', null, 'lol'),
                createElement('a', null, 'kek')
            )
        );
        return root_dropdown;
    }
}