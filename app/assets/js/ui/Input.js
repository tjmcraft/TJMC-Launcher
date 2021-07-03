/*export class TextInput {
    input;
    constructor(props) {
        this.props = props;
        this.create();
        this.update();
    }
    create() {
        this.input = cE('input', { type: 'text', placeholder: this.props?.placeholder || '' });
        this.input.oninput = (e) => this.onchange(e, this.input.value);
        this.root = cE('div', { class: 'input-wrapper', inptype: this.props?.type }, this.input);
    }
    get content() {
        return this.root;
    }
    update(props) {}
    onchange(event, value) {}
}*/

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