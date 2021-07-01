import { VersionChooser } from './versionChooser.js';
import { Settings } from './settings.js';
import { SVG } from './scripts/svg.js';


export class versionsSidebar {
    root_sidebar;
    root_content;
    constructor(props) {
        this.createBase();
    };
    createBase(...content) {
        this.root_content = cE('div', { class: 'sidebar' }, ...content);
        this.root_sidebar = cE('div', { class: 'sidebar-region' },
            this.root_content
        );
        return this.root_sidebar;
    };
    addItem(item, click = ()=>{}) {
        const root_item = cE('div', {
            class: 'item navItem',
            'version-id': item.id
        }, item.id);
        root_item.addEventListener('click', (e) => {
            this.selectVersion(item);
            if (typeof click === 'function')
                click.call(this, e, item);
        });
        this.root_content.appendChild(root_item);
    };
    removeItem(item) {
        const selected_item = this.root_content.qsl(`.item[version-id=${item.id}]`);
        this.root_content.removeChild(selected_item);
    };
    content(def = false) {
        return !def && this.root_sidebar ? this.root_sidebar : this.base();
    };
    selectVersion(version) {
        this.root_content.qsla('.item').forEach(e => {
            e.classList[e.getAttribute('version-id') === version.id ? 'add' : 'remove']('selected');
        });
    };
    removeAll() {
        this.root_content.qsla('.item.navItem').forEach(e => e.remove());
    };
}

export class Carousel {
    root_carousel;
    offset = 0;
    step = 100;
    maxX = -((this.step * 3) - this.step);
    constructor(props) {

    }
    createCarousel(...elements) {
        this.root_carousel = cE('div', { class: 'carousel' });
        for (const element of elements) {
            this.append(element);
        }
        return this.root_carousel;
    }
    moveRight() {
        if (!this.root_carousel) throw new Error('No carousel created');
        if (this.offset != this.maxX) {
            this.offset -= this.step;
            this.root_carousel.style.transform = `translateX(${this.offset}%)`;
        }
    }
    moveLeft() {
        if (!this.root_carousel) throw new Error('No carousel created');
        if (this.offset !== 0) {
            this.offset += this.step;
            this.root_carousel.style.transform = `translateX(${this.offset}%)`;
        }
    }
    append(content) {
        if (!this.root_carousel) throw new Error('No carousel created');
        this.root_carousel.appendChild(cE('div', { class: 'carousel-elm' }, content));
        const count = this.root_carousel.qsla('.carousel-elm').length;
        this.maxX = -((this.step * count) - this.step);
    }
    moveTo(index) {
        if (!this.root_carousel) throw new Error('No carousel created');
        const count = this.root_carousel.qsla('.carousel-elm').length;
        if (index > 0 && index < count){
            this.offset = -((this.step * index) - this.step)
            this.root_carousel.style.transform = `translateX(${this.offset}%)`;
        }
    }
}

export class Input {
    input_title;
    constructor(props) {
        this.type = props.type || 'text';
    }
    createPathInput(props) {
        const input = cE('input', { type: 'file', webkitdirectory: true, directory: true });
        this.input_title = cE('span', { class: 'title' }, props?.placeholder || 'path/to/dir');
        const button = cE('div', { class: 'small-button button' }, props?.button_name || 'Обзор');
        const root_element = cE('label', { class: 'input' }, input, this.input_title, button);
        input.onchange = (e) => {
            let files = e.target.files;
            var path = getPath(files[0].path);
            this.render({title: path})
            this.onchange(e, path, files);
        }
        return root_element;
    }
    createTextInput(props) {
        const input = cE('input', { type: 'text', placeholder: props?.placeholder || '' });
        input.oninput = (e) => this.onchange(e, input.value);
        return input;
    }
    createFileInput(props) {
        const input = cE('input', { type: 'file', multiple: props?.multiple || false });
        this.input_title = cE('span', { class: 'title' }, props?.placeholder || 'path/to/file');
        const button = cE('div', { class: 'small-button button' }, props?.button_name || 'Обзор');
        const root_element = cE('label', { class: 'input' }, input, this.input_title, button);
        input.onchange = (e) => {
            let files = e.target.files;
            var path = files[0].path;
            console.debug(path);
            this.render({title: path})
            this.onchange(e, path, files);
        }
        return root_element;
    }
    createResolutionInput(props) {
        const input_data = {}
        const width_input = cE('input', { type: 'text', placeholder: props?.w_placeholder || '', 'data-type': 'resolution-width' });
        width_input.oninput = (e) => {
            input_data.width = width_input.value
            this.onchange(e, input_data)
        }
        const height_input = cE('input', { type: 'text', placeholder: props?.h_placeholder || '', 'data-type': 'resolution-height' });
        height_input.oninput = (e) => {
            input_data.height = height_input.value
            this.onchange(e, input_data)
        }
        return cE('div', { class: 'resolution'},
            width_input,
            cE('div', { class: 'resolutionCross' }, '✖'),
            height_input
        )
    }
    create(props) {
        const root_element = cE('div', { class: 'input-wrapper', inptype: props?.type },
            this.type == 'path' ? this.createPathInput(props) :
                this.type == 'file' ? this.createFileInput(props) :
                    this.type == 'resolution' ? this.createResolutionInput(props) :
                        this.createTextInput(props)
        );
        return root_element;
    }
    render(props) {
        this.input_title.innerHTML = props.title;
    }
    onchange(e) {
        console.log(122)
    }
}

function getPath(path){
    path = path.match(/(^.*[\\\/]|^[^\\\/].*)/i);
    return path != null ? path[0] : false;
}

export function Button(props, ...elements) {
    return cE('button', props, cE('div', {class: 'content'}, ...elements))
}

export function FrameBar(props) {
    const root_container = cE('div', { id: 'frameBar' },
        cE('div', { class: 'content' },
            cE('div', { id: 'frameContentWin' },
                cE('div', { id: 'frameTitleDock' },
                    cE('span', { id: 'frameTitleText' }, 'TJMC-Launcher')
                ),
                cE('div', { id: 'frameButtonDockWin' },
                    cE('div', { class: ['frameButton', 'fMb'], id: 'frameButton_minimize', tabIndex: -1, html: true },
                        `<svg aria-hidden="false" width="12" height="12" viewBox="0 0 12 12"><rect fill="currentColor" width="10" height="1" x="1" y="6"></rect></svg>`
                    ),
                    cE('div', { class: ['frameButton', 'fRb'], id: 'frameButton_restoredown', tabIndex: -1, html: true },
                        `<svg aria-hidden="false" width="12" height="12" viewBox="0 0 12 12"><rect width="9" height="9" x="1.5" y="1.5" fill="none" stroke="currentColor"></rect></svg>`
                    ),
                    cE('div', { class: ['frameButton', 'fCb'], id: 'frameButton_close', tabIndex: -1, html: true },
                        `<svg aria-hidden="false" width="12" height="12" viewBox="0 0 12 12"><polygon fill="currentColor" fill-rule="evenodd" points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1"></polygon></svg>`
                    )
                )
            )
        )
    );
    return root_container
}