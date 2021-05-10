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
    root_sidebar;
    root_content;
    constructor(props) {
        this.base(null);
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
        this.root_sidebar = createElement('div', { class: 'scroller' },
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
            this.selectVersion(item)
            if (typeof click === 'function')
                click.call(this, item, e)
        })
        this.root_content.appendChild(root_item)
    };
    removeItem(item) {
        const selected_item = this.root_content.qsl(`.item[version-id=${item.id}]`)
        this.root_content.removeChild(selected_item)
    };
    content(def = false) {
        return !def && this.root_sidebar ? this.root_sidebar : this.base();
    };
    selectVersion(version) {
        let items = this.root_content.qsla('.item');
        items.forEach(e => {
            e.classList[e.getAttribute('version-id') === version.id ? 'add' : 'remove']('selected')
        });
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
    createFileInput(props) {
        const input = createElement('input', { type: 'file', webkitdirectory: true, multiple: true, directory: true });
        this.input_title = createElement('span', { class: 'title' }, props?.placeholder || 'path/to/dir');
        const button = createElement('div', { class: 'small-button button' }, props?.button_name || 'Обзор');
        const root_element = createElement('label', { class: 'input' }, input, this.input_title, button);
        input.onchange = (e) => {
            let files = e.target.files;
            var path = getPath(files[0].path);
            //console.log(files);
            this.onchange(e, path, files);
        }
        return root_element;
    }
    createTextInput(props) {
        const input = createElement('input', { type: 'text' });
        const root_element = createElement('label', { class: 'input' }, input);
        return root_element;
    }
    create(props) {
        const root_element = createElement('div', { class: 'input-wrapper' },
            this.type == 'file' ? this.createFileInput(props) :
                this.createTextInput(props)
        );
        return root_element;
    }
    render(props) {
        this.input_title.innerHTML = props.title;
    }
    onchange(e){}
}

function getPath(path){
    path = path.match(/(^.*[\\\/]|^[^\\\/].*)/i);
    return path != null ? path[0] : false;
}