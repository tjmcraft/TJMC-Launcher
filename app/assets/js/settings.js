class Settings {
    constructor() {
        this.layer = new Layer({
            label: 'USER_SETTINGS'
        })
        fetch('./settings.ejs').then(response => response.text()).then(text => {
            this.layer.appendHTML(text)

            this.sidebar = this.layer.content.qsl('.sidebar')
            this.sidebarItems = this.sidebar.qsla('.navItem')
            this.content = this.layer.content.qsla('.content .tab')

            this.tools = createToolsContainer(() => {
                this.destroy()
            })
            this.layer.append(this.tools)

            this.bindSidebarItems()

            this.escBinder = new escBinder()
            this.escBinder.bind(() => {
                this.destroy()
            })

            this.setTab('my-account-tab')
            this.layer.show()
        })
    }
    bindSidebarItems(){
        Array.from(this.sidebarItems).map((val) => {
            if(val.hasAttribute('rTi'))
                val.onclick = () => {
                    this.setTab(val.getAttribute('rTi'))
                }
        })
    }
    unbindSidebarItems(){
        Array.from(this.sidebarItems).map((val) => {
            if(val.hasAttribute('rTi')) val.onclick = () => {}
        })
    }
    setTab (tab) {
        this.content.forEach((el) => {
            el.toggle(el.id === tab)
        })
        this.sidebarItems.forEach((i) => {
            i.classList[i.getAttribute('rTi') === tab ? 'add' : 'remove']('selected')
        })
    }

    destroy() {
        this.escBinder.uibind()
        this.layer.destroy()
    }
}