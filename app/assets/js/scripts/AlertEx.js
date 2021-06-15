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
        this.root_container = cE('div', { class: 'container-ov1' + (params?.logType ? ' ' + 'mini' : '')});
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
                const ie = cE('div', { class: 'icon' }, data)
                this.root_container.appendChild(ie)
            }
        }

        if (params?.header) {
            const header = cE('h1', null, params.header)
            this.root_container.appendChild(header)
        }

        if (params?.text) {
            const text_root = cE('div', {class: 'content' + (params.logType ? ' ' + 'log' : '')}, params.text)
            this.root_container.appendChild(text_root)
        }

        if (params?.buttons) {
            //const hr = cE('hr')
            //this.root_container.append(hr)
            const button_root_container = cE('div', { class: 'vertical-button-container' });
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
        const overlay = cE('div', { class: 'overlay' }, ...nodes, closeButton ? createToolsContainer((e) => this.destroy) : null);
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
        this.root_container = container
        this.overlay = this.createOverlay(params?.escButton, this.root_container)
        //this.overlay.onclick = (e) => { this.destroy(e) }
        
        this.escBinder = new escBinder()
        this.escBinder.bind((e) => { this.destroy(e) })
        //this.show();
        this.regCP()
        this.regPC()
        this.regOC()
    }
    
    /**
     * Creates overlay root element
     * @param {Boolean} closeButton - Create cross close button ?
     * @param  {...any} nodes - Nodes for overlay
     * @returns 
     */
    createOverlay(closeButton = false, ...nodes) {
        const overlay = cE('div', { class: 'overlay hidden' }, ...nodes, closeButton ? createToolsContainer((e) => this.destroy) : null);
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

    get content() { return this.overlay; }

    Xt = 0

    regPC() {
        this.root_container.onmousedown = ()=>{
            this.overlay.onmouseup = (e) => {
                this.overlay.onmouseup = void 0,
                e.target === this.overlay && (this.Xt = 1)
            }
        }
    }

    regCP() {
        this.overlay.onmousedown = ()=>{
            this.root_container.onmouseup = (e) => {
                this.root_container.onmouseup = void 0,
                e.target !== this.root_container && !this.root_container.contains(e.target) || (this.Xt = 1)
            }
        }
    }

    regOC() {
        this.overlay.onclick = e => {
            (e.target === this.overlay && !this.Xt) && this.destroy();
            this.Xt = 0;
        }
    }

}


const modal = {
    /**
     * Create standart alert modal dialog with given parameters
     * @param {String} header - The header of the dialog
     * @param {String} msg - The main text of the dialog
     * @param {String} type - The type of the dialog (info, warning, error, success)
     * @param {Object} params - Additional parameters for the dialog
     * @param {Object} params.logType - Mode of the dialog when text is shown as a log
     * @param {Object} params.buttons - Buttons list (by default it's OK primary button)
     * @returns {Element} instance of element
     */
    alert: function (header = '', msg = '', type = null, params = {}) {

        const root_container = cE('div', { class: ['container-ov1', (params.logType ? 'mini' : '')] });
        root_container.onclick = (e) => { e.stopPropagation() };

        const modal_ex = new ModalEx({
            escButton: true
        }, root_container);

        /*if (type) {
            let data = null
            switch (type) {
                case 'info':
                    data = SVG('info-circle')
                    break
                case 'error':
                    data = SVG('error-circle')
                    break
                case 'warning':
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
                const ie = cE('div', { class: 'icon' }, data)
                root_container.appendChild(ie)
            }
        }*/
        
        if (header) {
            let root_parent = cE('div', { class: ['flex-group', 'horizontal', 'header-1'] },
                cE('h1', {class: ['wrapper', 'size20']}, header)
            );
            root_container.appendChild(root_parent);
        }
        
        if (msg) {
            let root_parent = cE('div', { class: ['content', (params.logType ? 'log' : '')] },
                cE('div', { class: ['colorStandart', 'size14'] }, msg)
            );
            root_container.appendChild(root_parent);
        }

        if (params?.buttons) {
            root_container.appendChild(this.BFooter(params?.buttons, () => { modal_ex.destroy() }));
        } else {
            root_container.appendChild(this.BFooter([{
                name: "Ок",
                //class: 'primary-button',
                closeOverlay: true
            }], () => { modal_ex.destroy() }));
        }
        modal_ex.show();
        return root_container;
    },

    /**
     * Creates footer with buttons
     * @param {Array} buttons - The array of buttons to create with
     * @param {Function} destroy - The function that will be called to destroy overlay
     * @returns {Element} instance of element
     */
    BFooter: function(buttons, destroy = () => {}) {
        let _buttons = buttons.map(button => {
                const button_root = Button({ class: ['grow', 'filled','colorBrand', (button.class ? button.class : '')] }, button.name)
                button_root.onclick = () => {
                    if (button.callback && typeof button.callback === 'function') button.callback.call(this)
                    if (button.closeOverlay) destroy.call(this)
                }
                return button_root;
        })
        return cE('div', { class: 'vertical-button-container' }, ..._buttons);
    },

    /**
     * Creates raw modal with given elements and parameters
     * @param {Object} props - Properties for the dialog
     * @param  {...any} elements - Elements to add
     * @returns {Element} instance of element
     */
    createRaw: function (props = {}, ...elements) {
        const root_container = cE('div', { class: ['container-ov1', props.class] }, ...elements);
        root_container.onclick = (e) => { e.stopPropagation() };

        const modal_ex = new ModalEx({
            escButton: props.escButton || true
        }, root_container);

        modal_ex.show();
        return modal_ex;
    },

    whatsNew: function (content, date = null) {
        const root_container = cE('div', { class: ['container-ov1', 'small'] });

        const modal_ex = new ModalEx({
            escButton: false
        }, root_container);

        const s_date = date ? new Date(date) : new Date();

        const close_button = cE('div', { class: ['flex-child', 'button'] }, SVG('cross'))
        close_button.onclick = () => { modal_ex.destroy(); }

        const root_hoz_header = cE('div', { class: ['flex-group', 'horizontal', 'header-1'] },
            cE('div', { class: ['flex-child'] },
                cE('h2', null, 'Что нового?'),
                cE('div', { class: ['size12', 'colorStandart', 'date']}, s_date.toLocaleDateString() || '18 May 2012')
            ),
            close_button
        )

        const root_content = cE('div', { class: ['content', 'thin-s'], html: true }, ...content)

        const footer = cE('div', { class: ['footer'] },
            cE('a', { class: 'anchor', href: 'https://twitter.com/MofThunder', rel: ['noreferrer', 'noopener'], target: '_blank'}, 'Twitter'),
            cE('a', { class: 'anchor', href: 'https://facebook.com/tjmcraft' }, 'Facebook'),
            cE('a', { class: 'anchor', href: 'https://instagram.com/tjmcraft.ga' }, 'Instagram'),
            cE('div', { class: ['size12', 'colorStandart'] }, 'Подписывайтесь на наш канал, здесь говорят правду')
        )

        root_container.append(root_hoz_header, root_content, footer);

        modal_ex.show();
        return modal_ex;
    }

}