/**
 * Creates alert box
 */
class AlertEx {
    /**
     * 
     * @param {Object} params - Parameters for alert
     * @param {Object} params.type - Type of alert
     * @param {Object} params.header - Header for alert
     * @param {Object} params.text - Text for alert
     * @param {Object} params.buttons List of buttons for alert
     * @param {Object} params.buttons.name - Name of button
     * @param {Object} params.buttons.class - Class of button
     * @param {Object} params.buttons.callback - Callback function for button
     * @param {Object} params.buttons.closeOverlay - Close overlay on button click ?
     * @param {Object} params.closeButton - Create close(cross) button ?
     * @param {...any} nodes - Additional nodes that will be added to main container
     * @returns
     */
    constructor(params = {}, ...nodes) {
        if (!params) throw new Error('No parametrs given');
        this.root_container = createElement('div', { class: 'container-ov1' + (params?.logType ? ' ' + 'mini' : '')});
        this.root_container.onclick = (event) => { event.stopPropagation() };

        if (params?.type) {
            let data = null
            switch (params.type) {
                case 'info':
                    data = SVG('info-circle')
                    break
                case 'error':
                    data = SVG('error-circle')
                    break
                case 'warn':
                    data = SVG('warn-circle')
                    break
                case 'success':
                    data = SVG('success-circle')
                    break
                default:
                    data = ''
                    break
            }
            if (data) {
                const ie = createElement('div', { class: 'icon' }, data)
                this.root_container.appendChild(ie)
            }
        }

        if (params?.header) {
            const header = createElement('h1', null, params.header)
            this.root_container.appendChild(header)
        }

        if (params?.text) {
            const text_root = createElement('div', {class: 'content' + (params.logType ? ' ' + 'log' : '')}, params.text)
            this.root_container.appendChild(text_root)
        }

        if (params?.buttons) {
            //const hr = createElement('hr')
            //this.root_container.append(hr)
            const button_root_container = createElement('div', { class: 'vertical-button-container' });
            for (let bp of params?.buttons) {
                const button_root = Button({ class: 'grow' + (bp.class ? ' ' + bp.class : '') }, bp.name)
                button_root.onclick = () => {
                    if (bp.callback && typeof bp.callback === 'function') bp.callback()
                    if (bp.closeOverlay) this.destroy()
                }
                button_root_container.appendChild(button_root)
            }
            this.root_container.appendChild(button_root_container);
        }

        for (const node of nodes) {
            this.root_container.append(node);
        }

        this.overlay = this.createOverlay(params?.closeButton, this.root_container)

        this.overlay.onclick = (e) => { this.destroy(e) }
        
        this.escBinder = new escBinder()
        this.escBinder.bind((e) => { this.destroy(e) })

        document.body.appendChild(this.overlay)

        setTimeout(() => {
            this.overlay.toggle(true)
        }, 50)

    }

    /**
     * Creates overlay root element
     * @param {Boolean} closeButton - Create cross close button ?
     * @param  {...any} nodes - Nodes for overlay
     * @returns 
     */
    createOverlay(closeButton = false, ...nodes) {
        const overlay = createElement('div', { class: 'overlay' }, ...nodes, closeButton ? createToolsContainer((e) => this.destroy) : null);
        overlay.toggle(false);
        return overlay;
    }

    destroy() {
        this.escBinder.uibind()
        this.overlay.toggle(false)
        setTimeout(() => {
            this.overlay.remove()
        }, 500)
    }

    /**
     * Append dom content to created layer
     * @param {*} content 
     */
    append(content) {
        this.root_container.append(content)
    }

    /**
     * Get current content(innerHTML) of created layer
     */
    get content() {
        return this.root_container
    }

    set innerContent(content) {
        this.root_container.innerHTML = content;
    }

    get innerContent() {
        return this.root_container.innerHTML;
    }

    create(callback = () => { }) {
        let content = null;
        if (typeof callback === 'function')
            content = callback.call(this) || null;
        return content;
    }

    sc = 'hidden'
}


/**
 * Creates modal overlay
 * @param {Object} params - Parameters for creating overlay
 * @param {Object} params.escButton - Create esc button
 * @param {Object} container - Container to insert to overlay
 */
class ModalEx {

    constructor(params = {}, container = null) {
        this.overlay = this.createOverlay(params?.escButton, container)
        this.overlay.onclick = (e) => { this.destroy(e) }
        
        this.escBinder = new escBinder()
        this.escBinder.bind((e) => { this.destroy(e) })
        //this.show();
    }
    
    /**
     * Creates overlay root element
     * @param {Boolean} closeButton - Create cross close button ?
     * @param  {...any} nodes - Nodes for overlay
     * @returns 
     */
    createOverlay(closeButton = false, ...nodes) {
        const overlay = createElement('div', { class: 'overlay hidden' }, ...nodes, closeButton ? createToolsContainer((e) => this.destroy) : null);
        return overlay;
    }

    create(callback = () => { }) {
        if (typeof callback === 'function')
            return callback.call(this) || null;
    }

    show() {
        document.body.appendChild(this.overlay)
        setTimeout(() => {
            this.overlay.toggle(true);
        }, 50)
        //this.overlay.fadeIn(300);
    }

    destroy() {
        this.escBinder.uibind()
        this.overlay.toggle(false);
        setTimeout(() => {
            this.overlay.remove();
        }, 400);
        /*this.overlay.fadeOut(300, () => {
            this.overlay.remove()
        });*/
    }

    /**
     * Append dom content to created layer
     * @param {*} content 
     */
    append(content) {
        this.overlay.append(content)
    }

}


const modal = {

    alert: function (header = '', msg = '', type = null, params = {}) {

        const root_container = createElement('div', { class: 'container-ov1' });
        root_container.onclick = (e) => { e.stopPropagation() };

        const modal = new ModalEx({
            escButton: true
        }, root_container);

        if (type) {
            let data = null
            switch (type) {
                case 'info':
                    data = SVG('info-circle')
                    break
                case 'error':
                    data = SVG('error-circle')
                    break
                case 'warn':
                    data = SVG('warn-circle')
                    break
                case 'success':
                    data = SVG('success-circle')
                    break
                default:
                    data = ''
                    break
            }
            if (data) {
                const ie = createElement('div', { class: 'icon' }, data)
                root_container.appendChild(ie)
            }
        }
        
        if (header) root_container.appendChild(createElement('h1', null, header))
        
        if (msg) root_container.appendChild(createElement('div', {class: 'content' + (params.logType ? ' ' + 'log' : '')}, msg))

        if (params?.buttons) {
            root_container.appendChild(this.BFooter(params?.buttons, () => { modal.destroy() }));
        } else {
            root_container.appendChild(this.BFooter([{
                name: "Ок",
                class: 'primary-button',
                closeOverlay: true
            }], () => { modal.destroy() }));
        }
        modal.show();
    },

    BFooter: function(buttons, destroy = () => {}) {
        let _buttons = buttons.map(button => {
                const button_root = Button({ class: 'grow' + (button.class ? ' ' + button.class : '') }, button.name)
                button_root.onclick = () => {
                    if (button.callback && typeof button.callback === 'function') button.callback.call(this)
                    if (button.closeOverlay) destroy.call(this)
                }
                return button_root;
        })
        return createElement('div', { class: 'vertical-button-container' }, ..._buttons);
    }

}