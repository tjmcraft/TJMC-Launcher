const {escBinder, toggleButtonBinder} = require('./uibind')
const label = 'USER_SETTINGS'
class Settings {
    constructor() {
        if (document.querySelector(`[aria-label=${label}]`)) return
        this.appLayers = document.querySelector('.app-layers')
        this.settings = createElementWithClass('div', 'layer')
        this.settings.setAttribute('aria-label', `${label}`)
        fetch('./settings.ejs').then(response => response.text()).then(text => {
            this.settings.innerHTML = text

            this.sidebar = this.settings.querySelector('.sidebar')
            this.sidebarItems = this.sidebar.querySelectorAll('.navItem')
            this.content = this.settings.querySelectorAll('.content .tab')

            let tools = createToolsContainer()
            tools.querySelector('#overlayCloseButton').onclick = () => {
                this.destroy()
            }
            this.settings.querySelector('.content').append(tools)

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
            if(val.hasAttribute('rTi')){
                val.onclick = () => {
                    this.setTab(val.getAttribute('rTi'))
                }
            }
        })
    }
    unbindSidebarItems(){
        Array.from(this.sidebarItems).map((val) => {
            if(val.hasAttribute('rTi')){
                val.onclick = () => {}
            }
        })
    }
    setTab (tab) {
        console.log('Setting tab: '+tab)
        this.content.forEach((el) => {
            el.toggle(false)
            if (el.id === tab) el.toggle(true)
        })
        this.sidebarItems.forEach((i) => {
            i.classList.remove('selected')
            if (i.getAttribute('rTi') === tab) i.classList.add('selected')
        })
    }

    destroy() {
        switchView(VIEWS.landing, 150, 150, () => {}, () => {}, () => {
            this.unbindSidebarItems()
            this.settings.remove()
            this.escBinder.uibind()
        })
    }
}

module.exports = Settings