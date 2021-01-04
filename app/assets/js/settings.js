const {escBinder, toggleButtonBinder} = require('./uibind')
class Settings {
    constructor() {
        console.log('Settings init')
        console.log(path.resolve(__dirname, '../../settings.ejs'))
        this.settings = document.querySelector('#frameSecond')
        this.settings.innerHTML = fs.readFileSync(path.resolve(__dirname, '../../settings.ejs'), 'utf8')

        this.sidebar = this.settings.querySelector('.sidebar')
        this.sidebarItems = this.sidebar.querySelectorAll('.settingsItem')
        this.content = this.settings.querySelectorAll('.content .tab')

        let tools = this.createToolsContainer()
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

    createToolsContainer() {
        let tools = this.createElementWithClass('div', 'tools frame-fix')
        let overlayCloseButton = this.createElementWithId('div', 'overlayCloseButton')
        let cross = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#dcddde" d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"></path></svg>'
        let keycode = this.createElementWithClass('div', 'keycode')
        keycode.innerText = 'ESC'

        overlayCloseButton.innerHTML += cross
        tools.append(overlayCloseButton, keycode)

        return tools
    }

    createElementWithId(el, id) {
        let e = document.createElement(el)
        e.id = id
        return e
    }

    createElementWithClass(el, cl) {
        let e = document.createElement(el)
        e.className = cl
        return e
    }

    destroy() {
        new appLayers().openMain()
        setTimeout(() => {
            this.settings.innerHTML = null
        }, 100)
        this.escBinder.uibind()
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