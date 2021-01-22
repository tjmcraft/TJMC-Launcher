class VersionChooser {
    constructor() {
        const label = 'VERSION_SELECTOR'
        if (qsl(`[aria-label=${label}]`)) return
        this.pV = getCurrentView()
        this.appLayers = qsl('.app-layers')
        this.vs = createElementWithClass('div', 'layer')
        this.vs.setAttribute('aria-label', `${label}`)
        fetch('./versions.ejs').then(response => response.text()).then(text => {
            this.vs.innerHTML = text

            this.sidebar = this.vs.qsl('#version-list .sidebar')
            this.sidebarItems = this.sidebar.qsla('.navItem')

            let tools = createToolsContainer()
            tools.qsl('#overlayCloseButton').onclick = () => {
                this.destroy()
            }
            this.vs.append(tools)

            this.escBinder = new escBinder()
            this.escBinder.bind(() => {
                this.destroy()
            })

            switchView(this.vs, 150, 150)
        })
        this.vs.style.opacity = 0
        this.appLayers.append(this.vs)
    }
    destroy() {
        switchView(this.pV, 150, 150, () => {}, () => {
            this.escBinder.uibind()
            this.vs.remove()
        })
    }
}