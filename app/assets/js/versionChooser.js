class VersionChooser {
    constructor() {
        this.layer = new Layer({
            label: 'VERSION_SELECTOR'
        })
        fetch('./versions.ejs').then(response => response.text()).then(text => {
            this.layer.appendHTML(text)

            this.sidebar = this.layer.content.qsl('#version-list .sidebar')
            this.sidebarItems = this.sidebar.qsla('.navItem')

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
        })
    }
    destroy() {
        this.escBinder.uibind()
        this.layer.destroy()
    }
    refreshVersions() {
        API.VersionManager.getGlobalVersions().then((parsed) => {
            this.sidebar.removeAllChildNodes()
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
        let c = this.sidebar
        let i = createElementWithClass('div', 'item navItem')
        i.setAttribute('version-id', item.id)
        i.innerHTML = item.id
        i.onclick = function() {
            //selectVersion(item)
        }
        c.append(i)
    }
    remItem(item) {
        let c = this.sidebar
        let i = c.qsl(`[version-id=${item.id}]`)
        c.removeChild(i)
    }
}