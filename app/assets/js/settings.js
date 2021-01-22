class Settings {
    constructor() {
        const label = 'USER_SETTINGS'
        if (qsl(`[aria-label=${label}]`)) return
        this.pV = getCurrentView()
        this.appLayers = qsl('.app-layers')
        this.settings = createElementWithClass('div', 'layer')
        this.settings.setAttribute('aria-label', `${label}`)
        fetch('./settings.ejs').then(response => response.text()).then(text => {
            this.settings.innerHTML = text

            this.sidebar = this.settings.qsl('.sidebar')
            this.sidebarItems = this.sidebar.qsla('.navItem')
            this.content = this.settings.qsla('.content .tab')

            let tools = createToolsContainer()
            tools.qsl('#overlayCloseButton').onclick = () => {
                this.destroy()
            }
            this.settings.qsl('.content').append(tools)

            this.bindSidebarItems()

            this.escBinder = new escBinder()
            this.escBinder.bind(() => {
                this.destroy()
            })

            this.setTab('my-account-tab')
            switchView(this.settings, 150, 150)
        })
        this.settings.style.opacity = 0
        this.appLayers.append(this.settings)
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
        switchView(this.pV, 150, 150, () => {}, () => {
            this.escBinder.uibind()
            this.unbindSidebarItems()
            this.settings.remove()
        })
    }
}