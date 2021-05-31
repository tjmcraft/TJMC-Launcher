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
    /**
     * Create standart alert modal dialog with given parameters
     * @param {String} header - The header of the dialog
     * @param {String} message - The main text of the dialog
     * @param {String} type - The type of the dialog (info, warning, error, success)
     * @param {Object} params - Additional parameters for the dialog
     * @param {Object} params.logType - Mode of the dialog when text is shown as a log
     * @param {Object} params.buttons - Buttons list (by default it's OK primary button)
     * @returns {Element} instance of element
     */
    alert: function (header = '', msg = '', type = null, params = {}) {

        const root_container = createElement('div', { class: 'container-ov1' });
        root_container.onclick = (e) => { e.stopPropagation() };

        const modal_ex = new ModalEx({
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
                const ie = createElement('div', { class: 'icon' }, data)
                root_container.appendChild(ie)
            }
        }
        
        if (header) root_container.appendChild(createElement('h1', null, header))
        
        if (msg) root_container.appendChild(createElement('div', {class: 'content' + (params.logType ? ' ' + 'log' : '')}, msg))

        if (params?.buttons) {
            root_container.appendChild(this.BFooter(params?.buttons, () => { modal_ex.destroy() }));
        } else {
            root_container.appendChild(this.BFooter([{
                name: "Ок",
                class: 'primary-button',
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
                const button_root = Button({ class: 'grow' + (button.class ? ' ' + button.class : '') }, button.name)
                button_root.onclick = () => {
                    if (button.callback && typeof button.callback === 'function') button.callback.call(this)
                    if (button.closeOverlay) destroy.call(this)
                }
                return button_root;
        })
        return createElement('div', { class: 'vertical-button-container' }, ..._buttons);
    },

    /**
     * Creates raw modal with given elements and parameters
     * @param {Object} props - Properties for the dialog
     * @param  {...any} elements - Elements to add
     * @returns {Element} instance of element
     */
    createRaw: function (props = {}, ...elements) {
        const root_container = createElement('div', { class: ['container-ov1', props.class] }, ...elements);
        root_container.onclick = (e) => { e.stopPropagation() };

        const modal_ex = new ModalEx({
            escButton: props.escButton || true
        }, root_container);

        modal_ex.show();
        return root_container;
    },

    whatsNew: function () {
        const root_container = createElement('div', { class: ['container-ov1', 'small'] });
        root_container.onclick = (e) => { e.stopPropagation() };

        const modal_ex = new ModalEx({
            escButton: false
        }, root_container);

        const root_hoz_header = createElement('div', { class: ['flex-group', 'horizontal', 'header-1'] },
            createElement('div', { class: ['flex-child'] },
                createElement('h2', null, 'Whats new?'),
                createElement('div', { class: ['size12', 'colorStandart', 'date']}, '18 May 2012')
            ),
            createElement('div', { class: ['flex-child', 'button'] }, SVG('cross'))
        )

        const root_content = createElement('div', { class: ['content', 'thin-s'] },
            `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi eget ultrices ipsum. Suspendisse mauris massa, blandit id hendrerit eget, tempor vitae turpis. Curabitur id eleifend nunc, sed tempus erat. Integer eu erat id nisl tincidunt venenatis. Nulla at mattis felis. Etiam fringilla erat at neque egestas, vel suscipit orci facilisis. In eros tellus, aliquam sit amet metus eu, efficitur rutrum tortor. Nulla sed risus sit amet odio dapibus pulvinar. Nullam mattis finibus elit eget sodales. Nam iaculis pulvinar ante, eget imperdiet elit tempus ut. Aliquam quis volutpat tortor, id dictum arcu.

Aenean iaculis quam sem, quis interdum ligula volutpat vel. Cras congue nunc nec odio rutrum, at ornare urna euismod. Sed ac scelerisque libero. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Ut sed accumsan massa. Nulla laoreet sem id scelerisque placerat. Praesent et nibh quis ex fermentum maximus eget id risus. Duis sed elit pellentesque, lobortis magna a, tincidunt erat. Maecenas ut nulla ultricies, tincidunt quam eget, ultrices elit. Quisque dignissim diam id ex tempor commodo.

Morbi egestas maximus sem, ac euismod neque sollicitudin in. Mauris auctor pulvinar augue, in lobortis erat ullamcorper sed. Maecenas eget magna risus. Nullam vitae dignissim justo. Aliquam tellus dolor, auctor ac risus hendrerit, posuere faucibus velit. Maecenas dolor risus, accumsan ac magna sit amet, consequat scelerisque nulla. Nunc pellentesque blandit ex eget rhoncus. Duis id egestas ex. Mauris vel eros lacus. Curabitur dolor odio, luctus eget convallis nec, finibus at lorem. Duis mollis purus in porta bibendum. Sed non dapibus metus. Suspendisse nec erat tristique, ornare felis facilisis, sagittis ex. Nullam eu nunc ante. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Pellentesque quis aliquam augue, at scelerisque velit.

Donec efficitur lorem quis aliquet molestie. Ut auctor porttitor lectus, vitae sodales lectus placerat et. Sed non erat efficitur, dictum enim ut, aliquet erat. Ut lacinia, quam et vulputate auctor, magna odio tristique sapien, ut molestie lorem odio sit amet nibh. Sed vulputate ullamcorper mi, in hendrerit lectus venenatis et. Aliquam blandit vulputate arcu in efficitur. Pellentesque ut tincidunt nisi. Cras facilisis ante eu ante gravida faucibus. Donec rutrum metus metus, eget scelerisque mi semper aliquam. Nullam ut dui nec odio volutpat convallis. Curabitur condimentum laoreet sem non molestie. Phasellus enim elit, aliquam tempor ante eu, interdum auctor libero. Praesent quis orci id felis gravida lacinia ut a felis. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae;

Donec orci urna, consectetur sed scelerisque pellentesque, dapibus eget tellus. Nunc rhoncus mauris sit amet magna finibus bibendum. Quisque quis risus fringilla, egestas felis non, pretium felis. Sed tortor dui, imperdiet sed odio ac, maximus ullamcorper odio. Vivamus consequat tincidunt aliquet. Ut et sem et dui euismod venenatis at non enim. Curabitur id nulla velit. Nullam dapibus, eros non imperdiet mollis, nisi dolor elementum neque, rhoncus tincidunt velit turpis et nisl. Donec id facilisis sapien. Maecenas quam massa, suscipit quis dictum ut, tincidunt non risus. Fusce cursus risus non tortor pellentesque, vel elementum felis luctus. Sed risus augue, porta ac commodo sit amet, aliquet ac velit. Duis dignissim erat ullamcorper, lobortis dui non, pellentesque eros.`
        )

        const footer = createElement('div', { class: ['footer'] },
            createElement('a', { class: 'anchor' }, 'Twitter'),
            createElement('a', { class: 'anchor' }, 'Facebook'),
            createElement('a', { class: 'anchor' }, 'Instagram'),
            createElement('div', { class: ['size12', 'colorStandart'] }, 'Подписывайтесь на наш канал, здесь говорят правду')
        )

        root_container.append(root_hoz_header, root_content, footer);

        modal_ex.show();
        return root_container;
    }

}