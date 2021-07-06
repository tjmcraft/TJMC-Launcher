
import { SVG } from "../scripts/svg.js";
import { Base } from "../ui/MainLayout.js";

/*class SidebarHome {
    items = [];
    constructor(props) {
        this.create();
    }
    create() {
        this.root = cE('div', { class: ['scroller', 'thin-s']});
    }
    get content() {
        return this.root;
    }
    update() {}
    addItem(item, click = () => {}) {
        this.items[item.id] = sidebarItem({avatar: item.avatar, content: item.content, id: item.id});
        this.items[item.id].onclick = (e) => {
            this.selectItem(item.id)
            if (typeof click === 'function') click.call(this, item, e);
        }
        this.root.appendChild(this.items[item.id])
    }
    selectItem(id) {
        const items = this.root.qsla('.categoryItem');
        items.forEach(item => item.classList[item.getAttribute('data-id') === id ? 'add' : 'remove']('selected'))
    }
    removeAll() {
        this.root.qsla('.categoryItem').forEach(item => item.remove());
    }
}*/

class Sidebar {
    constructor(props) {
        this.create();
    }
    create() {
        this.root = cE('div', { class: ['scroller', 'thin-s']});
    }
    get content() {
        return this.root;
    }
    update() {}
    addItem(item) {
        this.root.appendChild(item);
    }
    selectItem(id) {
        const items = this.root.qsla('.categoryItem');
        items.forEach(item => item.classList[item.getAttribute('data-id') === id ? 'add' : 'remove']('selected'))
    }
    removeAll() {
        this.root.removeAllChildNodes();
    }
}

function sidebarItem(props) {
    const root = cE('div', { class: ['categoryItem'], 'data-id': props.id }, 
        cE('div', { class: ['innerItem'] }, 
            cE('div', { class: ['avatar'] }, props.avatar),
            cE('div', { class: ['content'] }, props.content)
        )
    );
    root.onclick = (e) => {
        if (typeof props.click === 'function') props.click.call(this, e);
    }
    return root;
}

export class HomeContainer {
    initialized = false;
    constructor(props) {
        this.sideBar = new Sidebar();
        this.topContainer = null;
        this.mainBase = new Base(null, [
            /*cE('div', { class: ['scroller', 'thin-s']},
                cE('h2', {class: ['headerDiscover', 'size24']}, 'Главная'),
                cE('div', {class: ['categoryItem', 'selected'] }, 
                    cE('div', {class: ['innerItem'] }, 
                        cE('div', {class: ['avatar'] }, SVG('compass')),
                        cE('div', {class: ['content'] }, "Главная")
                    )
                ),
                cE('div', {class: ['categoryItem'] }, 
                    cE('div', {class: ['innerItem'] }, 
                        cE('div', {class: ['avatar'] }, SVG('compass')),
                        cE('div', {class: ['content'] }, "Главная")
                    )
                ),
                cE('div', {class: ['categoryItem'] }, 
                    cE('div', {class: ['innerItem'] }, 
                        cE('div', {class: ['avatar'] }, SVG('compass')),
                        cE('div', {class: ['content'] }, "Главная")
                    )
                )
            )*/
            this.sideBar.content
        ], [
            //cE('iframe', { src: 'https://www.tjmcraft.ga', seamless: true, style: 'width: 100%;height: 100%;'})
        ]);
        this.create();
    }
    create() {
        this.root = this.mainBase.content;
        const sidebarItems = [
            cE('h2', {class: ['headerDiscover', 'size24']}, 'Главная'),
            sidebarItem({
                id: '1',
                avatar: SVG('compass'),
                content: 'Обзор',
                click: () => {
                    this.sideBar.selectItem('1')
                    this.mainBase.updateMainContent([
                        cE('iframe', { src: 'https://www.tjmcraft.ga', seamless: true, style: 'width: 100%;height: 100%;'})
                    ]);
                }
            }),
            sidebarItem({
                id: '2',
                avatar: SVG('news'),
                content: 'Новости',
                click: () => {
                    this.sideBar.selectItem('2')
                    this.mainBase.updateMainContent([
                        cE('iframe', { src: 'https://www.tjmcraft.ga/news', seamless: true, style: 'width: 100%;height: 100%;'})
                    ]);
                }
            }),
            sidebarItem({
                id: '3',
                avatar: SVG('virus'),
                content: 'COVID-19',
                click: () => {
                    this.sideBar.selectItem('3')
                    this.mainBase.updateMainContent([
                        cE('iframe', { src: 'https://www.tjmcraft.ga/coronavirus', seamless: true, style: 'width: 100%;height: 100%;'})
                    ]);
                }
            }),
            sidebarItem({
                id: '4',
                avatar: SVG('map'),
                content: 'Карта',
                click: () => {
                    this.sideBar.selectItem('4')
                    this.mainBase.updateMainContent([
                        cE('iframe', { src: 'https://www.tjmcraft.ga/map', seamless: true, style: 'width: 100%;height: 100%;'})
                    ]);
                }
            })
        ];
        this.sideBar.removeAll();
        for (const item of sidebarItems) {
            this.sideBar.addItem(item)
        }
    }
    get content() {
        return this.root;
    }
    init() {
        if (this.initialized) return;
        this.initialized = true;
    }
}