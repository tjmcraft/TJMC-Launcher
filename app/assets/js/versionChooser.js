class VersionChooser {
    el = [];
    carousel;
    selected_props = [];
    constructor() {
        this.tools = createToolsContainer(() => {
            this.destroy()
        })

        this.escBinder = new escBinder()
        this.escBinder.bind(() => {
            this.destroy()
        })

        this.refreshVersions()

        this.alertex = new AlertEx({ header: 'Добавление версии' },
            createElement('div', { class: 'inner-container'}, this.Base, this.tools)
        )
        this.el.sidebar = this.alertex.content.qsl('#version-list .sidebar')
    }
    destroy() {
        this.escBinder.uibind()
        this.alertex.destroy()
    }
    refreshVersions() {
        API.VersionManager.getGlobalVersions().then((parsed) => {
            this.el.sidebar.removeAllChildNodes()
            for (const cv in parsed) {
                this.addItem(parsed[cv])
            }
        })
    }
    addItem(item) {
        let c = this.el.sidebar
        let i = createElement('div', {class: 'item navItem'})
        i.setAttribute('version-id', item.id)
        i.innerHTML = item.id
        i.onclick = function(e) { }
        c.append(i)
    }
    remItem(item) {
        let c = this.el.sidebar
        let i = c.qsl(`[version-id=${item.id}]`)
        c.removeChild(i)
    }

    get Base() {
        const root = createElement('div', { class: 'container', id: 'version-selector' },
            createElement('div', { class: 'sidebar-main', id: 'version-list' },
                this.dropdown,
                createElement('div', { class: 'sidebar-region' }, this.sidebar)
            ),
            createElement('div', { class: 'base', id: 'main' },
                this.mainContent
            )
        )
        return root;
    }

    get sidebar() {
        const sidebar_items = [
            { type: 'navItem bgL' },
            { type: 'navItem bgL' },
            { type: 'navItem bgL' },
            { type: 'navItem bgL' },
            { type: 'navItem bgL' },
            { type: 'navItem bgL' }
        ];
        const items = sidebar_items.map(i => {
            const root_item = createElement('div', { class: 'item' + (i.type ? ' ' + i.type : '') });
            return root_item;
        });
        const root_sidebar = createElement('div', { class: 'sidebar' }, ...items);
        return root_sidebar;
    }

    get dropdown() {
        const dropdown_items = [
            { name: 'lol', click: function (e) { console.log(e) } },
            { name: 'kek', click: function (e) { console.log(e) } }
        ];
        const dd_elements = dropdown_items.map(i => {
            const root_item = createElement('a', null, i.name);
            root_item.onclick = i.click;
            return root_item;
        });
        const svg_element = SVG('dropdown-key');
        const dropdown = createElement('div', { class: 'dropdown hidden', id: 'dd-elements' }, ...dd_elements);
        const root_dropdown = createElement('div', { class: 'container-f', id: 'dropdown-list' },
            createElement('div', { class: 'header' },
                createElement('h1', null, 'Версии'),
                svg_element
            ),
            dropdown
        );
        root_dropdown.onclick = (e) => {
            svg_element.classList.toggle('open')
            dropdown.toggle()
        };
        return root_dropdown;
    }

    get mainContent() {
        this.carousel = new Carousel();
        // ================================================ //
        let firstContent = (props) => {
            const next_button = createElement('button', { class: 'primary-button' }, 'Далее');
            next_button.onclick = () => {
                secondContent(this.selected_props)
            }
            const header = createElement('h2', null, 'Выберите тип версии');
            const release_button = createElement('button', { 'data-type': 'release' }, 'Release')
            const snapshot_button = createElement('button', { 'data-type': 'snapshot' }, 'Snapshot')
            const modified_button = createElement('button', { 'data-type': 'modified' }, 'Modified')
            const old_beta_button = createElement('button', { 'data-type': 'old_beta' }, 'Beta')
            const old_alpha_button = createElement('button', { 'data-type': 'old_alpha' }, 'Alpha')
            const root_flex = createElement('div', { class: 'VT-flex-box' }, release_button, snapshot_button, modified_button, old_beta_button, old_alpha_button)
            root_flex.onclick = (e) => {
                let type = e.target?.dataset?.type;
                if (type && type !== 'undefined' && type !== null) {
                    console.debug(type)
                    this.selected_props.type = type;
                }
                secondContent(this.selected_props)
            }
            const root_content = createElement('div', { class: 'main-content' },
                header,
                createElement('div', { class: 'divider separator' }),
                root_flex,
                //createElement('div', { class: 'divider separator' }),
                //next_button
            );
            return root_content;
        }
        let secondContent = (props) => {
            API.VersionManager.getGlobalVersions().then((parsed) => {
                if (props.type && props.type !== 'undefined' && props.type !== null) {
                    /*for (const cv in parsed) {
                        const version = parsed[cv];
                        if (version.type == props.type){
                            console.log(version)
                        }
                    }*/
                    let versions = parsed.filter((e) => { return e.type == props.type })
                    //console.log(versions)
                    for (const version of versions) {
                        console.debug(version)
                        root_flex.append(createElement('button', { 'data-id': version.id, 'data-type': version.type }, version.id))
                    }
                } else {
                    let versions = parsed
                    console.log(versions)
                }
            })
            const next_button = createElement('button', { class: 'primary-button' }, 'Далее');
            next_button.onclick = () => {
                thirdContent(this.selected_props)
            }
            const header = createElement('h2', null, 'Выберите версию');
            const root_flex = createElement('div', { class: 'VT-flex-box'});
            const root_content = createElement('div', { class: 'main-content' },
                header,
                createElement('div', { class: 'divider separator' }),
                root_flex,
                //createElement('div', { class: 'divider separator' }),
                //next_button
            );
            //return root_content;
            this.carousel.append(root_content);
            this.carousel.moveRight();
        }
        let thirdContent = (props) => {
            const next_button = createElement('button', { class: 'primary-button' }, 'Далее');
            next_button.onclick = () => { this.carousel.moveRight() }
            const header = createElement('h2', null, 'Выберите версию');
            const root_content = createElement('div', { class: 'main-content' },
                header,
                createElement('div', { class: 'divider separator' }),
                createElement('div', { class: 'VT-flex-box'},
                    createElement('button', { 'data-type': 'release' }, 'Release'),
                    createElement('button', { 'data-type': 'snapshot' }, 'Snapshot'),
                    createElement('button', { 'data-type': 'modified' }, 'Modified'),
                    createElement('button', { 'data-type': 'old_beta' }, 'Beta'),
                    createElement('button', { 'data-type': 'old_alpha' }, 'Alpha')
                ),
                createElement('div', { class: 'divider separator' }),
                next_button
            );
            //return root_content;
            this.carousel.append(root_content);
            this.carousel.moveRight();
        }

        const root_slider = this.carousel.createCarousel(firstContent());
        return root_slider;
    }
}