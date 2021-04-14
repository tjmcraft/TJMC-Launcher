class Settings {
    el = []
    tablist = [
        {id: 'my-account-tab', name: 'Моя учётная запись', content: this.content.my_account_tab},
        {id: 'skin-tab', name: 'Сменить скин', content: this.content.skin_tab},
        {id: 'minecraft-settings', name: 'Игровые настройки', content: this.content.minecraft_settings_tab},
        {id: 'java-settings', name: 'Настройки Java', content: this.content.java_settings_tab},
        {id: 'launcher-settings', name: 'Настройки лаунчера', content: this.content.launcher_settings_tab},
        {id: 'about-tab', name: 'О нас', content: this.content.about_tab}
    ];
    constructor() {
        this.layer = new Layer({
            label: 'USER_SETTINGS'
        })

        let base = this.getBase;
        this.layer.append(base)

        this.el.sidebarItems = this.layer.content.qsla('.sidebar-region > .sidebar > .navItem')
        this.el.content = this.layer.content.qsl('.content')

        this.tools = createToolsContainer(() => {
            this.destroy()
        })
        this.layer.append(this.tools)

        this.escBinder = new escBinder()
        this.escBinder.bind(() => {
            this.destroy()
        })

        this.setTab('my-account-tab')
        this.layer.show()
    }
    destroy() {
        this.escBinder.uibind()
        this.layer.destroy()
    }
    setTab (tab) {
        this.el.sidebarItems.forEach((i) => {
            i.classList[i.getAttribute('rTi') === tab ? 'add' : 'remove']('selected')
        })

        let tab_p = this.tablist.find((i) => {
            return i.id === tab;
        }) || tablist[0];
        this.el.content.removeAllChildNodes();
        this.el.content.appendChild(tab_p.content);
    }
    get getBase() {
        let root = createElement('div', {class: 'sidebarView', id: 'user-settings'},
            createElement('div', {class: 'sidebar-region'}, this.sideBar),
            createElement('div', {class: 'content-region'},
                createElement('div', {class: 'transitionWrap'}, 
                    createElement('div', {class: 'content'})
                )
            )
        );
        return root;
    }
    get sideBar() {
        let sidebar_items = [
            {type: 'header', content: 'Настройки пользователя'},
            {type: 'navItem', content: 'Моя учётная запись', rti: 'my-account-tab'},
            {type: 'navItem', content: 'Сменить скин', rti: 'skins-tab'},
            {type: 'separator'},
            {type: 'header', content: 'Настроки Игры'},
            {type: 'navItem', content: 'Игровые настройки', rti: 'minecraft-settings'},
            {type: 'navItem', content: 'Настройки Java', rti: 'java-settings'},
            {type: 'separator'},
            {type: 'navItem', content: 'Настроки Лаунчера', rti: 'launcher-settings'},
            {type: 'separator'},
            {type: 'navItem', content: 'О нас', rti: 'about-tab'}
        ];
        const root_sidebar = createElement('div', {class: 'sidebar'});
        sidebar_items.forEach(i => {
            let root_item = createElement('div', {class: 'item' + (i.type ? ' ' + i.type : ''), rti: i.rti}, i.content);
            if (i.rti) {root_item.onclick = () => {this.setTab(i.rti)};}
            root_sidebar.appendChild(root_item);
        });
        return root_sidebar;
    }
    content = {
        base(id, ...e) {
            return createElement('div', {class: 'tab', id: id}, ...e);
        },
        createChilderContainer(...e) {
            return createElement('div', {class: 'children'}, ...e);
        },
        get my_account_tab() {
            let heading = createElement('h2', null, 'Моя учётная запись');
            return this.base('my-account-tab', heading);
        },
        get skin_tab() {
            let heading = createElement('h2', null, 'Конфигурация скина');
            return this.base('skin-tab', heading);
        },
        get minecraft_settings_tab() {
            let icf3v_ints = (props) => {
                let cb = createElement('input', {type: 'checkbox', id: props.id, checked: props.checked || false});
                cb.addEventListener('change', function (event) {alert('changed') });
                return (
                    createElement('div', {class: 'container-icf3v'},
                        createElement('div', {class: 'labelRow'},
                            createElement('label', {for: props.id, class: 'title-3uvn'}, props.header),
                            createElement('div', {class: 'control'},
                                createElement('label', {class: 'toggleSwitch'},
                                    cb,
                                    createElement('span', {class: 'toggleSwitchSlider'})
                                )
                            )
                        ),
                        createElement('div', {class: 'note'}, props.note),
                        createElement('div', {class: 'divider separator'})
                    )
                )
            }
            let heading = createElement('h2', null, 'Настройки Minecraft');
            let children = this.createChilderContainer(
                createElement('div', {class: 'container-cc3V'}, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In sit amet diam vel nunc aliquet molestie. Nullam tincidunt sapien lacus, eget mattis lorem volutpat a. Aliquam blandit vehicula ultricies. Proin eget diam vitae elit fermentum laoreet quis sed justo. Donec eget mi bibendum, cursus lectus in, molestie est. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Sed aliquet mauris ut enim cursus, ut hendrerit turpis semper. Pellentesque tempor est lacus. Donec accumsan est a sem scelerisque, quis mattis ex ornare. Sed vitae erat eget augue dictum molestie a sit amet metus. Donec et ex nibh. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Pellentesque vehicula sit amet tortor non volutpat. Cras euismod tincidunt eros, nec porttitor metus fringilla vitae. In sodales mauris massa, quis faucibus est mollis ut.'),
                createElement('div', {class: 'separator'}),
                createElement('div', {class: 'container-cc3V'}, 
                    createElement('h5', null, 'Как мы используем ваши данные'),
                    icf3v_ints({
                        id: 'uid_1',
                        header: 'Использование данных для улучшения TJMC',
                        note: 'Эта настройка позволяет нам в аналитических целях использовать и обрабатывать информацию о том, как вы перемещаетесь по TJMC и используете его. Это позволяет, к примеру, давать вам доступ к тестированию новых функций.',
                        checked: true,
                        action: ()=>{}
                    }),
                    icf3v_ints({
                        id: 'uid_2',
                        header: 'Использование данных для персонализации опыта использования TJMC',
                        note: ' Этот параметр позволяет нам использовать информацию (например, о том, с кем вы общаетесь или во что играете), чтобы настроить TJMC лично для вас. ',
                        checked: true,
                        action: ()=>{}
                    })
                )
            
            );
            return this.base('minecraft-settings-tab', heading, children);
        },
        get java_settings_tab() {
            let heading = createElement('h2', null, 'Настройки Java');
            return this.base('java-settings-tab', heading);
        },
        get launcher_settings_tab() {
            let heading = createElement('h2', null, 'Настройки Лаунчера');
            return this.base('launcher-settings-tab', heading);
        },
        get about_tab() {
            let heading = createElement('h2', null, 'О нас');
            let children = this.createChilderContainer(
                createElement('div', {class: 'container-cc3V'},
                    createElement('h5', null, 'Просмотр информации о текущем релизе и заметки к выпуску'), 
                    createElement('div', {class: 'note'}, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In sit amet diam vel nunc aliquet molestie. Nullam tincidunt sapien lacus, eget mattis lorem volutpat a. Aliquam blandit vehicula ultricies. Proin eget diam vitae elit fermentum laoreet quis sed justo. Donec eget mi bibendum, cursus lectus in, molestie est. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Sed aliquet mauris ut enim cursus, ut hendrerit turpis semper. Pellentesque tempor est lacus. Donec accumsan est a sem scelerisque, quis mattis ex ornare. Sed vitae erat eget augue dictum molestie a sit amet metus. Donec et ex nibh. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Pellentesque vehicula sit amet tortor non volutpat. Cras euismod tincidunt eros, nec porttitor metus fringilla vitae. In sodales mauris massa, quis faucibus est mollis ut.')
                )
            );
            return this.base('about-tab', heading, children);
        }
    }
}