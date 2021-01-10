const {escBinder, toggleButtonBinder} = require('./uibind')
const path = require('path')
const fs = require('fs')

class Settings {
    constructor() {
        this.settings = document.querySelector('#frameSecond')
        //this.settings.innerHTML = fs.readFileSync(path.resolve(__dirname, '../../settings.ejs'), 'utf8')

        this.sidebar = this.settings.querySelector('.sidebar')
        this.sidebarItems = this.sidebar.querySelectorAll('.settingsItem')
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
        switchView(VIEWS.landing, 35, 35, () => {}, () => {}, () => {
            //this.settings.innerHTML = null
            this.escBinder.uibind()
        })
    }
}

module.exports = Settings


/**
 * Functions toogle all elements using css
 * @param {boolean} s state to toggle (it can be null)
 */
Element.prototype.toggle = function(s = null) {
    let cl = this.classList,
        c = 'hidden'
    if (s != null ? s : cl.contains(c) == 1){
        cl.remove(c)
    } else {
        cl.add(c)
    }
}