class Settings {
    el = []
    constructor() {
        this.layer = new Layer({
            label: 'USER_SETTINGS'
        })
        //fetch('./settings.ejs').then(response => response.text()).then(text => {
            let text = this.getBase;
            this.layer.appendHTML(text)

            this.sidebarRegion = this.layer.content.qsl('.sidebar-region')
            this.sidebarRegion.append(this.sideBar);
            this.sidebar = this.sidebarRegion.qsl('.sidebar')
            this.sidebarItems = this.sidebar.qsla('.navItem')
            this.el.content = this.layer.content.qsl('.content')
            console.debug(this.el.content);

            this.tools = createToolsContainer(() => {
                this.destroy()
            })
            this.layer.append(this.tools)

            //this.bindSidebarItems()

            this.escBinder = new escBinder()
            this.escBinder.bind(() => {
                this.destroy()
            })

            this.setTab('my-account-tab')
            this.layer.show()
        //})
    }
    destroy() {
        this.escBinder.uibind()
        this.layer.destroy()
    }
    setTab (tab) {
        /*this.el.content.forEach((el) => {
            el.toggle(el.id === tab)
        })*/
        this.sidebarItems.forEach((i) => {
            i.classList[i.getAttribute('rTi') === tab ? 'add' : 'remove']('selected')
        })
        let tablist = [
            {name: 'my-account-tab', content: this.content.my_account_tab},
            {name: 'skin-tab', content: this.content.skin_tab},
            {name: 'minecraft-settings', content: this.content.minecraft_settings_tab},
            {name: 'java-settings', content: this.content.java_settings_tab},
            {name: 'launcher-settings', content: this.content.launcher_settings_tab},
            {name: 'about-tab', content: this.content.about_tab}
        ];
        let tab_p = tablist.find((i) => {
            return i.name === tab;
        }) || tablist[0];
        this.el.content.removeAllChildNodes();
        this.el.content.appendChild(tab_p.content);
    }
    get getBase() {
        return /*html*/`
        <div class="sidebarView" id="user-settings">
            <div class="sidebar-region"></div>
            <div class="content-region">
                <div class="transitionWrap">
                    <div class="content"></div>
                </div>
            </div>
        </div>
        `
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
            return createElement('div', {class: 'children'}, 
                createElement('div', {class: 'container-cc3V'}, ...e)
            );
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
            let heading = createElement('h2', null, 'Настройки Minecraft');
            let root = /*html*/`
                <div class="children">
                    <div class="container-cc3V">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. In sit amet diam vel nunc aliquet molestie. Nullam tincidunt sapien lacus, eget mattis lorem volutpat a. Aliquam blandit vehicula ultricies. Proin eget diam vitae elit fermentum laoreet quis sed justo. Donec eget mi bibendum, cursus lectus in, molestie est. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Sed aliquet mauris ut enim cursus, ut hendrerit turpis semper. Pellentesque tempor est lacus. Donec accumsan est a sem scelerisque, quis mattis ex ornare. Sed vitae erat eget augue dictum molestie a sit amet metus. Donec et ex nibh. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Pellentesque vehicula sit amet tortor non volutpat. Cras euismod tincidunt eros, nec porttitor metus fringilla vitae. In sodales mauris massa, quis faucibus est mollis ut.
                    </div>
                    <div class="separator"></div>
                    <div class="container-cc3V">
                        <h5>Как мы используем ваши данные</h5>
                        <div class="container-icf3v">
                            <div class="labelRow">
                                <label for="uid_1" class="title-3uvn">Использование данных для улучшения TJMC</label>
                                <div class="control">
                                    <label class="toggleSwitch">
                                        <input type="checkbox" cValue="Fullscreen" id="uid_1">
                                        <span class="toggleSwitchSlider"></span>
                                    </label>
                                </div>
                            </div>
                            <div class="note">
                                Эта настройка позволяет нам в аналитических целях использовать и обрабатывать информацию о том, как вы перемещаетесь по TJMC и используете его. Это позволяет, к примеру, давать вам доступ к тестированию новых функций.
                            </div>
                            <div class="divider separator"></div>
                        </div>
                        <div class="container-icf3v">
                            <div class="labelRow">
                                <label for="uid_2" class="title-3uvn">Использование данных для персонализации опыта использования TJMC</label>
                                <div class="control">
                                    <label class="toggleSwitch">
                                        <input type="checkbox" cValue="Fullscreen" id="uid_2">
                                        <span class="toggleSwitchSlider"></span>
                                    </label>
                                </div>
                            </div>
                            <div class="note">
                                Этот параметр позволяет нам использовать информацию (например, о том, с кем вы общаетесь или во что играете), чтобы настроить TJMC лично для вас. <a class="anchor" href="#">Подробнее</a>
                            </div>
                            <div class="divider separator"></div>
                        </div>
                    </div>
                </div>
            `
            return this.base('minecraft-settings-tab', heading, root);
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
                createElement('h5', null, 'Просмотр информации о текущем релизе и заметки к выпуску'), 
                createElement('div', {class: 'note'}, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In sit amet diam vel nunc aliquet molestie. Nullam tincidunt sapien lacus, eget mattis lorem volutpat a. Aliquam blandit vehicula ultricies. Proin eget diam vitae elit fermentum laoreet quis sed justo. Donec eget mi bibendum, cursus lectus in, molestie est. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Sed aliquet mauris ut enim cursus, ut hendrerit turpis semper. Pellentesque tempor est lacus. Donec accumsan est a sem scelerisque, quis mattis ex ornare. Sed vitae erat eget augue dictum molestie a sit amet metus. Donec et ex nibh. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Pellentesque vehicula sit amet tortor non volutpat. Cras euismod tincidunt eros, nec porttitor metus fringilla vitae. In sodales mauris massa, quis faucibus est mollis ut.')
            );
            return this.base('about-tab', heading, children);
        }
    }
}