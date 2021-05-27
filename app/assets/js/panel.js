/**
 * This function creates a user panel, with the given props
 * @param {Object} props - Properties to create user panel
 * @param {String} props.username - Name of the user
 * @param {String} props.permission - Permission of the user
 * @returns 
 */
let user_panel = function (props) {
    props.username = props.username || '';
    props.permission = props.permission || '';
    const add_version_button = createElement('button', { class: 'button', id: 'add-version-button' }, SVG('add-plus'));
    add_version_button.onclick = (e) => { new VersionChooser() }
    add_version_button.tooltip('Добавить версию')
    const settings_button = createElement('button', { class: 'button', id: 'settings-button' }, SVG('settings-gear'));
    settings_button.tooltip('Настройки')
    settings_button.onclick = (e) => { new Settings() }
    const root_panel = createElement('section', { class: 'panel' },
        createElement('div', { class: 'container' },
            createElement('div', { class: 'avatar round' },
                createElement('img', { src: `https://api.tjmcraft.ga/v1/skin.render?aa=true&ratio=20&vr=0&hr=0&headOnly=true&user=${props.username}` })
            ),
            createElement('div', { class: 'nameTag' },
                createElement('div', { class: 'title' }, props.username),
                createElement('div', { class: 'subtitle' }, props.permission)
            ),
            add_version_button,
            settings_button
        )
    )
    return root_panel;
}

class SidebarMain {
    root_scroller;
    root_content;
    root_fp;
    constructor(props) {
        this.base();
    };
    base() {
        const add_button = createElement('div', { class: 'simple-button' }, SVG('add-plus'));
        add_button.onclick = (e) => { new VersionChooser() }
        add_button.tooltip('Добавить версию')
        this.root_content = createElement('div', { class: 'content' },
            createElement('h2', { class: 'versionsHeader container-df' },
                createElement('span', null, 'Версии'),
                add_button
            )
        )
        this.root_scroller = createElement('div', { class: 'scroller' },
            this.root_content
        );
        return this.root_scroller;
    };
    addItem(item, click = ()=>{}) {
        const root_item = createElement('div', {
            class: 'item navItem',
            'version-hash': item.hash
        }, item.name || item.hash);
        //console.debug(item);
        root_item.addEventListener('click', (e) => {
            this.selectVersion(item)
            if (typeof click === 'function')
                click.call(this, item, e)
        })
        this.root_content.appendChild(root_item)
    };
    createFirstPage() {
        this.root_fp = createElement('div', {
            class: 'item centred fp'
        }, createElement('h1', {}, 'Добавьте версию'));
        this.root_scroller.appendChild(this.root_fp)
    };
    removeFirstPage() {
        this.root_fp && this.root_fp.remove();
    };
    removeItem(item) {
        const selected_item = this.root_content.qsl(`.item[version-hash=${item.hash}]`)
        this.root_content.removeChild(selected_item)
    };
    content(def = false) {
        return !def && this.root_scroller ? this.root_scroller : this.base();
    };
    selectVersion(version_hash) {
        let items = this.root_content.qsla('.item');
        items.forEach(e => {
            e.classList[e.getAttribute('version-hash') === version_hash ? 'add' : 'remove']('selected')
        });
    };
    removeAll() {
        this.removeFirstPage();
        this.root_content.qsla('.item').forEach(e => e.remove());
    };
}

class versionsSidebar {
    root_sidebar;
    root_content;
    constructor(props) {
        this.createBase();
    };
    createBase(...content) {
        this.root_content = createElement('div', { class: 'sidebar' }, ...content);
        this.root_sidebar = createElement('div', { class: 'sidebar-region' },
            this.root_content
        );
        return this.root_sidebar;
    };
    addItem(item, click = ()=>{}) {
        const root_item = createElement('div', {
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

class Carousel {
    root_carousel;
    offset = 0;
    step = 100;
    maxX = -((this.step * 3) - this.step);
    constructor(props) {

    }
    createCarousel(...elements) {
        this.root_carousel = createElement('div', { class: 'carousel' });
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
        this.root_carousel.appendChild(createElement('div', { class: 'carousel-elm' }, content));
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

class Input {
    input_title;
    constructor(props) {
        this.type = props.type || 'text';
    }
    createPathInput(props) {
        const input = createElement('input', { type: 'file', webkitdirectory: true, directory: true });
        this.input_title = createElement('span', { class: 'title' }, props?.placeholder || 'path/to/dir');
        const button = createElement('div', { class: 'small-button button' }, props?.button_name || 'Обзор');
        const root_element = createElement('label', { class: 'input' }, input, this.input_title, button);
        input.onchange = (e) => {
            let files = e.target.files;
            var path = getPath(files[0].path);
            this.render({title: path})
            this.onchange(e, path, files);
        }
        return root_element;
    }
    createTextInput(props) {
        const input = createElement('input', { type: 'text', placeholder: props?.placeholder || '' });
        input.oninput = (e) => this.onchange(e, input.value);
        return input;
    }
    createFileInput(props) {
        const input = createElement('input', { type: 'file', multiple: props?.multiple || false });
        this.input_title = createElement('span', { class: 'title' }, props?.placeholder || 'path/to/file');
        const button = createElement('div', { class: 'small-button button' }, props?.button_name || 'Обзор');
        const root_element = createElement('label', { class: 'input' }, input, this.input_title, button);
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
        const width_input = createElement('input', { type: 'text', placeholder: props?.w_placeholder || '', 'data-type': 'resolution-width' });
        width_input.oninput = (e) => {
            input_data.width = width_input.value
            this.onchange(e, input_data)
        }
        const height_input = createElement('input', { type: 'text', placeholder: props?.h_placeholder || '', 'data-type': 'resolution-height' });
        height_input.oninput = (e) => {
            input_data.height = height_input.value
            this.onchange(e, input_data)
        }
        return createElement('div', { class: 'resolution'},
            width_input,
            createElement('div', { class: 'resolutionCross' }, '✖'),
            height_input
        )
    }
    create(props) {
        const root_element = createElement('div', { class: 'input-wrapper', inptype: props?.type },
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

function Button(props, ...elements) {
    return createElement('button', props, createElement('div', {class: 'content'}, ...elements))
}