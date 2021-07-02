
import { slider } from './ui/slider-element.js';
import { modal } from "./scripts/AlertEx.js";
import { getConfig, getMem, setConfig } from "./scripts/Tools.js";

export class Settings {

    /**
     * Virtual DOM
     */
    vdom = {}

    /**
     * Tab List
     */
    tablist = [
        { id: '', name: '', content: null }
    ]

    constructor(tab = '') {
        this.tablist = [{
                id: 'my-account-tab',
                name: 'Моя учётная запись',
                content: this.content.my_account_tab
            },
            {
                id: 'skin-tab',
                name: 'Сменить скин',
                content: this.content.skin_tab
            },
            {
                id: 'minecraft-settings',
                name: 'Игровые настройки',
                content: this.content.minecraft_settings_tab
            },
            {
                id: 'java-settings',
                name: 'Настройки Java',
                content: this.content.java_settings_tab
            },
            {
                id: 'launcher-settings',
                name: 'Настройки лаунчера',
                content: this.content.launcher_settings_tab
            },
            {
                id: 'about-tab',
                name: 'О программе',
                content: this.content.about_tab
            }
        ];
        this.alertex = modal.createRaw({ escButton: true }, cE('div', { class: 'inner-container' }, this.Base))
        this.setTab(tab || 'my-account-tab')
    }
    async setTab(tab) {
        const current_tab = this.tablist.find(i => i.id === tab) || tablist[0];
        const tab_content = await current_tab.content.call(this.content);
        this.vdom.sidebarItems.forEach(i => i.classList[i.getAttribute('rTi') === tab ? 'add' : 'remove']('selected'))
        this.vdom.content.removeAllChildNodes();
        this.vdom.content.appendChild(tab_content);
    }
    get Base() {
        this.vdom.content = cE('div', { class: ['content', 'auto-s'] });
        const root = cE('div', { class: 'sidebarView', id: 'user-settings' },
            cE('div', { class: 'sidebar-region' }, this.sideBar),
            cE('div', { class: 'content-region' },
                cE('div', { class: 'transitionWrap' },
                    this.vdom.content
                )
            )
        );
        return root;
    }
    get sideBar() {
        const sidebar_items = [
            { type: 'header', content: 'Настройки пользователя' },
            { type: 'navItem', rti: 'my-account-tab' },
            { type: 'navItem', rti: 'skin-tab' },
            { type: 'separator' },
            { type: 'header', content: 'Настроки Игры' },
            { type: 'navItem', rti: 'minecraft-settings' },
            { type: 'navItem', rti: 'java-settings' },
            { type: 'separator' },
            { type: 'navItem', rti: 'launcher-settings' },
            { type: 'separator' },
            { type: 'navItem', rti: 'about-tab' }
        ];
        const root_sidebar = cE('div', { class: 'sidebar' });
        this.vdom.sidebarItems = sidebar_items.map(i => {
            const root_item = cE('div', { class: 'item' + (i.type ? ' ' + i.type : ''), rti: i.rti }, i.content || this.tablist.find((e) => { return e.id == i.rti; })?.name || '');
            if (i.rti) { root_item.onclick = () => { this.setTab(i.rti) }; }
            return root_item;
        });
        root_sidebar.append(...this.vdom.sidebarItems);
        return root_sidebar;
    }
    content = {
        base(id, ...e) {
            return cE('div', { class: 'tab', id: id }, ...e);
        },
        createChilderContainer(...e) {
            return cE('div', { class: 'children' }, ...e);
        },
        async my_account_tab() {
            const heading = cE('h2', null, 'Моя учётная запись');
            const actions_button = cE('button', { class: ['r', 'filled', 'colorBrand'] }, 'Профиль');
            const children = cE('div', { class: ['container-cc3V'] },
                cE('div', { class: 'bxcF1-box' },
                    cE('div', { class: 'ictx-flex' },
                        cE('div', { class: 'icon' }, cE('img', { src: 'https://api.tjmcraft.ga/v1/skin.render?aa=true&ratio=20&vr=0&hr=0&headOnly=true&user=MakAndJo' })),
                        cE('div', { class: ['flex-group', 'vertical'] },
                            cE('span', { class: ['vbx', 'cu'] },
                                cE('div', { class: 'text name' }, 'MakAndJo'),
                                cE('div', { class: 'text id' }, '#11')
                            ),
                            cE('div', { class: ['sizeW', 'colorStandart', 'subtitle-p'] }, 'Default')
                        ),
                        actions_button
                    ),
                    cE('div', { class: 'separator' }),
                    cE('div', { class: 'fieldList' },
                        cE('div', { class: ['field'], 'data-type': 'email' },
                            cE('div', { class: ['containedRow'] },
                                cE('div', null,
                                    cE('h5', { class: '' }, 'Email'),
                                    cE('div', null,
                                        cE('span', { class: ['colorHeaderPrimary'] }, 'makandjo@outlook.com')
                                    )
                                )
                            ),
                            cE('button', { class: ['filled'] }, 'Изменить')
                        )
                    )
                )
            )
            return this.base('my-account-tab', heading, children);
        },
        async skin_tab() {
            const heading = cE('h2', null, 'Конфигурация скина');
            return this.base('skin-tab', heading);
        },
        async minecraft_settings_tab() {
            const config = await getConfig();
            const heading = cE('h2', null, 'Настройки Minecraft');
            const children = this.createChilderContainer(
                cE('div', { class: 'container-cc3V' },
                    cE('h5', null, 'Параметры запуска'),
                    this.icf3v_ints({
                        header: 'Запускать в режиме Fullscreen',
                        note: 'Запускать игру, принудительно в полноэкранном режиме',
                        checked: config.minecraft.launch.fullscreen || false,
                        action: function(s, n) {
                            config.minecraft.launch.fullscreen = s;
                            setConfig(config);
                        }
                    }),
                    this.icf3v_ints({
                        header: 'Автоматически подключаться к серверу',
                        note: 'Подключаться к серверу автоматически, при запуске игры',
                        checked: false,
                        action: function(s, n) {
                            console.log(n + ' ' + s);
                        }
                    })
                )
            );
            return this.base('minecraft-settings-tab', heading, children);
        },
        async java_settings_tab() {
            const config = await getConfig();
            const mem = await getMem();
            const gT16 = (mem * 1024 * 1024) - 16000000000;
            const AbsoluteMaxRAM = Math.floor((mem * 1024 * 1024 - 1000000000 - (gT16 > 0 ? (Number.parseInt(gT16 / 8) + 16000000000 / 4) : mem * 1024 * 1024 / 4)) / 1000000000) * 1024;
            const AbsoluteMinRAM = mem >= 5722 ? 2048 : 1024;

            const heading = cE('h2', null, 'Настройки Java');
            const children = this.createChilderContainer(
                cE('div', { class: 'container-cc3V' },
                    cE('div', { class: 'flex-group horizontal' },
                        cE('div', { class: 'flex-child' },
                            cE('h5', null, 'Максимальное использование памяти'),
                            slider({
                                value: config.java.memory.max / 1024,
                                min: 0.5,
                                max: (AbsoluteMaxRAM / 1024) || 8,
                                step: 0.1,
                                unit: 'Gb',
                                action: (e) => {
                                    config.java.memory.max = Math.floor(e * 1024);
                                    setConfig(config);
                                }
                            })
                        ),
                        cE('div', { class: 'flex-child' },
                            cE('h5', null, 'Минимальное использование памяти'),
                            slider({
                                value: config.java.memory.min / 1024,
                                min: 0.5,
                                max: (AbsoluteMinRAM / 1024) || 5,
                                step: 0.1,
                                unit: 'Gb',
                                action: (e) => {
                                    config.java.memory.min = Math.floor(e * 1024);
                                    setConfig(config);
                                }
                            })
                        )
                    ),
                    cE('div', { class: 'divider separator' })
                ),
                cE('div', { class: 'container-cc3V' },
                    cE('h5', null, 'Дополнительно'),
                    this.icf3v_ints({
                        header: 'Независимый процесс',
                        note: 'Если этот параметр выключен, то при закрытии лаунчера, автоматически закроется процесс игры',
                        checked: config.java.detached,
                        action: function(s, n) {
                            config.java.detached = s;
                            setConfig(config);
                        }
                    }),
                    this.icf3v_ints({
                        header: 'Запускать в режиме Fullscreen',
                        note: 'Запускать игру, принудительно в полноэкранном режиме',
                        checked: config.minecraft.launch.fullscreen || false,
                        action: function(s, n) {
                            config.minecraft.launch.fullscreen = s;
                            setConfig(config);
                        }
                    })
                )
            );
            return this.base('java-settings-tab', heading, children);
        },
        async launcher_settings_tab() {
            const config = await getConfig();
            const heading = cE('h2', null, 'Настройки Лаунчера');
            const children = this.createChilderContainer(
                cE('div', { class: 'container-cc3V' },
                    cE('h5', null, 'Параметры загрузки'),
                    this.icf3v_ints({
                        header: 'Проверять Hash файлов',
                        note: 'Эта опция позволяет вам отлючать проверку хэша файлов. \nНе рекомендуется отключать, так как обновления файлов не будут скачанны автоматически!',
                        checked: typeof config.overrides?.checkHash != undefined ? config.overrides.checkHash : true,
                        action: function(s, n) {
                            config.overrides.checkHash = s;
                            setConfig(config);
                        }
                    }),
                    cE('h5', null, 'Как мы используем ваши данные'),
                    this.icf3v_ints({
                        header: 'Использование данных для улучшения TJMC',
                        note: 'Эта настройка позволяет нам в аналитических целях использовать и обрабатывать информацию о том, как вы перемещаетесь по TJMC и используете его. Это позволяет, к примеру, давать вам доступ к тестированию новых функций.',
                        checked: true,
                        action: function(s, n) {
                            console.log(n + ' ' + s);
                        }
                    }),
                    this.icf3v_ints({
                        header: 'Использование данных для персонализации опыта использования TJMC',
                        note: ' Этот параметр позволяет нам использовать информацию (например, о том, с кем вы общаетесь или во что играете), чтобы настроить TJMC лично для вас. <a class="anchor" href="https://www.tjmcraft.ga/help">Подробнее</a>',
                        checked: true,
                        action: function(s, n) {
                            console.log(n + ' ' + s);
                        }
                    })
                )
            )
            return this.base('launcher-settings-tab', heading, children);
        },
        async about_tab() {
            const heading = cE('h2', null, 'О программе');
            const whats_new_nutton = cE('button', { class: 'r' }, 'Что нового?');
            whats_new_nutton.onclick = () => {
                modal.whatsNew([
                    cE('img', { src: 'https://www.tjmcraft.ga/nav_cr.png' }),
                    cE('h1', { class: ['margin-top', 'title', 'added'] }, 'Привет, это TJMC'),
                    cE('p', null, 'В общем, мы решили изменить свой внешний вид.'),
                ])
            }
            const children = this.createChilderContainer(
                cE('div', { class: 'container-cc3V' },
                    //cE('h5', null, 'Просмотр информации о текущем релизе и заметки к выпуску'),
                    cE('div', { class: 'bxcF1-box' },
                        cE('div', { class: 'ictx-flex' },
                            cE('div', { class: 'icon' }, cE('img', { src: './assets/images/icon.png' })),
                            cE('span', { class: 'vbx' },
                                cE('div', { class: 'text name' }, 'TJMC-Launcher'),
                                cE('div', { class: 'text version' }, 'v1.8.0')
                            ),
                            whats_new_nutton
                        ),
                        cE('div', { class: 'separator' }),
                        cE('div', { class: 'note flex-group' },
                            cE('div', { class: 'description', html: true }, 'TJMC-Company Co. Ltd.'),
                            cE('a', { href: 'https://github.com/MakAndJo/TJMC-Launcher', class: 'anchor' }, 'Source (GitHub)'),
                            cE('a', { href: 'https://www.tjmcraft.ga/help', class: 'anchor' }, 'Поддержка'),
                            cE('a', { href: 'https://www.tjmcraft.ga/launcher', class: 'anchor' }, 'Сайт')
                        )
                    ),
                    cE('div', { class: 'bxcF1-box' },
                        cE('h5', null, 'Просмотр информации о предыдущих релизах'),
                        cE('div', { class: 'separator' })
                    )
                    //cE('div', {class: 'note'}, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In sit amet diam vel nunc aliquet molestie. Nullam tincidunt sapien lacus, eget mattis lorem volutpat a. Aliquam blandit vehicula ultricies. Proin eget diam vitae elit fermentum laoreet quis sed justo. Donec eget mi bibendum, cursus lectus in, molestie est. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Sed aliquet mauris ut enim cursus, ut hendrerit turpis semper. Pellentesque tempor est lacus. Donec accumsan est a sem scelerisque, quis mattis ex ornare. Sed vitae erat eget augue dictum molestie a sit amet metus. Donec et ex nibh. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Pellentesque vehicula sit amet tortor non volutpat. Cras euismod tincidunt eros, nec porttitor metus fringilla vitae. In sodales mauris massa, quis faucibus est mollis ut.')
                )
            );
            return this.base('about-tab', heading, children);
        },
        icf3v_ints(props) {
            props.id = props.id || randomString(5);
            props.header = props.header || '';
            props.note = props.note || '';
            props.checked = props.checked || false;
            const checkbox = cE('input', { type: 'checkbox', id: props.id, checked: props.checked });
            checkbox.addEventListener('change', function(e) {
                if (typeof props.action === 'function')
                    props.action.call(this, this.checked, props.id)
            });
            const description = cE('div', { class: 'description', html: true }, props.note);
            return (
                cE('div', { class: 'container-icf3v' },
                    cE('div', { class: 'labelRow' },
                        cE('label', { for: props.id, class: 'title-3uvn' }, props.header),
                        cE('div', { class: 'control' },
                            cE('label', { class: 'toggleSwitch' },
                                checkbox,
                                cE('span', { class: 'toggleSwitchSlider' })
                            )
                        )
                    ),
                    cE('div', { class: 'note' }, description),
                    cE('div', { class: 'divider separator' })
                )
            )
        }
    }
}