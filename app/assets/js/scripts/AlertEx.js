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
        this.root_container = createElement('div', { class: 'container-ov1' + (params?.type ? ' ' + 'mini' : '')});
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
}