
import { SVG } from './svg.js';
import { escBinder } from './uibind.js';
import { Button } from '../panel.js';
import { randomString } from './Tools.js';

/**
 * Creates modal overlay
 * @param {Object} params - Parameters for creating overlay
 * @param {Object} params.escButton - Create esc button
 * @param {Object} params.escBind - Allow to destroy the overlay when ESC click
 * @param {Object} params.allowOutsideClick - Allow outside click on the overlay
 * @param {Object} params.label - Unique Label for the overlay
 * @param {Object} container - Container to insert to overlay
 */
class ModalEx {

    constructor(params = {}, container = null) {
        this.params = params;
        this.label = `layer-${this.params.label || randomString(5)}`;
        if (qsl(`#${this.label}`)) return;
        this.root_container = container;
        this.overlay = this.createOverlay(this.params?.escButton, this.root_container);

        

        if (typeof this.params?.escBind !== 'undefined' ? this.params?.escBind : true) {
            this.escBinder = new escBinder();
            this.escBinder.bind((e) => { this.destroy(e) });
        }

        this.handleModalMousedown();
        this.handleContainerMousedown();
        this.handleModalClick();
    }
    
    /**
     * Creates overlay root element
     * @param {Boolean} closeButton - Create cross close button ?
     * @param  {...any} nodes - Nodes for overlay
     * @returns 
     */
    createOverlay(closeButton = false, ...nodes) {
        const overlay = cE('div', { class: 'overlay hidden', id: this.label }, ...nodes, closeButton ? this.createToolsContainer((e) => this.destroy(e)) : null);
        return overlay;
    }

    create(callback = () => { }) {
        if (typeof callback === 'function')
            return callback.call(this) || null;
    }

    show() {
        this.overlay && document.body.qsl('#app-mount > .layerContainer').appendChild(this.overlay) &&
        setTimeout(() => {
            this.overlay.toggle(true);
        }, 50);
        //this.overlay.fadeIn(300);
    }

    destroy() {
        this.escBinder?.uibind();
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
        this.overlay.append(content);
    }

    get content() { 
        return this.overlay;
    }

    /**
     * The function creates and returns tools container for overlay
     */
    createToolsContainer(click = () => {}) {
        let tools = cE('div', {
            class: ['tools', 'frame-fix']
        })
        let overlayCloseButton = cE('div', {
            class: 'overlayCloseButton'
        }, SVG('cross'))
        overlayCloseButton.onclick = click
        let keycode = cE('div', {
            class: ['keycode']
        }, 'ESC')
        tools.append(overlayCloseButton, keycode)
        return tools
    }

    ignoreOutsideClick = false

    handleModalMousedown = () => {
        this.root_container.onmousedown = () => {
            this.overlay.onmouseup = (e) => {
                this.overlay.onmouseup = undefined
                if (e.target === this.overlay) {
                    this.ignoreOutsideClick = true
                }
            }
        }
    }

    handleContainerMousedown = () => {
        this.overlay.onmousedown = () => {
            this.root_container.onmouseup = (e) => {
                this.root_container.onmouseup = undefined
                if (e.target === this.root_container || this.root_container.contains(e.target)) {
                    this.ignoreOutsideClick = true
                }
            }
        }
    }

    handleModalClick = () => {
        this.overlay.onclick = e => {
            if (this.ignoreOutsideClick) {
                this.ignoreOutsideClick = false
                return
            }
            if (e.target === this.overlay && (typeof this.params?.allowOutsideClick !== 'undefined' ? this.params?.allowOutsideClick : true)) {
                this.destroy();
            }
        }
    }

}


export const modal = {
    /**
     * Create standart alert modal dialog with given parameters
     * @param {String} header - The header of the dialog
     * @param {String} msg - The main text of the dialog
     * @param {String} type - The type of the dialog (info, warning, error, success)
     * @param {Object} params - Additional parameters for the dialog
     * @param {Object} params.logType - Mode of the dialog when text is shown as a log
     * @param {Object} params.buttons - Buttons list (by default it's OK primary button)
     * @param {Object} params.buttons.name - Name of the button
     * @param {Object} params.buttons.class - Additional class for button
     * @param {Object} params.buttons.closeOverlay - Should we close the overlay after click (auto event)
     * @param {Object} params.buttons.callback - Callback when click the button
     * @param {Object} params.allowOutsideClick - Allow outside click on the overlay
     * @param {Object} params.escButton - Show esc button on the overlay
     * 
     * @returns {Element} instance of element
     */
    alert: function (header = '', msg = '', type = null, params = {}) {

        const root_container = cE('div', { class: ['container-ov1', (params.logType ? 'mini' : '')] });
        root_container.onclick = (e) => e.stopPropagation();

        const modal_ex = new ModalEx({
            escButton: typeof params?.escButton !== 'undefined' ? params?.escButton : true,
            allowOutsideClick: typeof params?.allowOutsideClick !== 'undefined' ? params?.allowOutsideClick : true,
            label: randomString(5)
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
                cE('h1', { class: ['wrapper', 'size20'] }, header)
            );
            root_container.appendChild(root_parent);
        }
        
        if (msg) {
            let root_parent = cE('div', { class: ['content', 'thin-s', (params.logType ? 'log' : '')] },
                cE('div', { class: ['colorStandart', 'size14'] }, msg)
            );
            root_container.appendChild(root_parent);
        }

        if (params?.buttons) {
            root_container.appendChild(ButtonsFooter(params?.buttons, () => { modal_ex.destroy() }));
        } else {
            root_container.appendChild(ButtonsFooter([
                {
                    name: "Ок",
                    class: ['filled', 'colorBrand'],
                    closeOverlay: true
                }
            ], () => { modal_ex.destroy() }));
        }
        modal_ex.show();
        return root_container;
    },

    /**
     * Creates raw modal with given elements and parameters
     * @param {Object} props - Properties for the dialog
     * @param {Object} props.escButton - ESC Button to close
     * @param {Object} props.label - Unique Label for the overlay
     * @param  {...any} elements - Elements to add
     * @returns {Element} instance of element
     */
    createRaw: function (props = {}, ...elements) {
        const root_container = cE('div', { class: ['container-ov1', props.class] }, ...elements);
        //root_container.onclick = (e) => { e.stopPropagation() };

        const modal_ex = new ModalEx({
            escButton: typeof props?.escButton !== 'undefined' ? props?.escButton : true,
            label: props?.label || randomString(5),
        }, root_container);

        modal_ex.show();
        return modal_ex;
    },

    whatsNew: function (content, date = null) {
        const root_container = cE('div', { class: ['container-ov1', 'small'] });

        const modal_ex = new ModalEx({
            escButton: false,
            label: 'whats-new'
        }, root_container);

        const s_date = date ? new Date(date) : new Date();

        const close_button = cE('div', { class: ['flex-child', 'button'] }, SVG('cross'))
        close_button.onclick = () => { modal_ex.destroy(); }

        const root_hoz_header = cE('div', { class: ['flex-group', 'horizontal', 'header-1'] },
            cE('div', { class: ['flex-child'] },
                cE('h2', null, 'Что нового?'),
                cE('div', { class: ['size12', 'colorStandart', 'date'] }, s_date.toLocaleDateString() || '18 May 2012')
            ),
            close_button
        )

        const root_content = cE('div', { class: ['content', 'thin-s'], html: true }, ...content)

        const footer = cE('div', { class: ['footer'] },
            cE('a', { class: 'anchor', href: 'https://twitter.com/MofThunder', rel: ['noreferrer', 'noopener'], target: '_blank' }, 'Twitter'),
            cE('a', { class: 'anchor', href: 'https://facebook.com/tjmcraft' }, 'Facebook'),
            cE('a', { class: 'anchor', href: 'https://instagram.com/tjmcraft.ga' }, 'Instagram'),
            cE('div', { class: ['size12', 'colorStandart'] }, 'Подписывайтесь на наш канал, здесь говорят правду')
        )

        root_container.append(root_hoz_header, root_content, footer);

        modal_ex.show();
        return modal_ex;
    }

};

/**
 * Creates footer with buttons
 * @param {Array} buttons - The array of buttons to create with
 * @param {Function} destroy - The function that will be called to destroy overlay
 * @returns {Element} instance of element
 */
const ButtonsFooter = function (buttons, destroy = () => {}) {
    let _buttons = buttons.map(button => {
        const button_root = Button({
            class: ['grow', ...(button.class ? button.class : '')]
        }, button.name)
        button_root.onclick = () => {
            if (button.callback && typeof button.callback === 'function') button.callback.call(this)
            if (button.closeOverlay) destroy.call(this)
        }
        return button_root;
    })
    return cE('div', {
        class: 'vertical-button-container'
    }, ..._buttons);
}