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
    const settings_button = createElement('button', { class: 'button', id: 'settings-button' }, SVG('settings-gear'));
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

let sidebar = function (props) {
    /*const sidebar_items = [
        { type: 'versionsHeader container-df', content: 'Версии' }
        { type: 'navItem bgL' },
        { type: 'navItem bgL' },
        { type: 'navItem bgL' },
        { type: 'navItem bgL' },
        { type: 'navItem bgL' },
        { type: 'navItem bgL' }
    ];
    const items = sidebar_items.map(i => {
        const root_item = createElement('div', { class: 'item' + (i.type ? ' ' + i.type : '') }, i.content || '');
        return root_item;
    });*/
    const root_sidebar = createElement('div', { class: 'scroller' },
        createElement('div', { class: 'content' },
            createElement('h2', { class: 'versionsHeader container-df' },
                createElement('span', { style: 'flex: 1;' }, 'Версии'),
                createElement('div', { class: 'simple-button'}, SVG('add-plus'))
            )
        )
    );
    return root_sidebar;
}