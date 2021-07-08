
import { SVG } from "../../scripts/svg.js";
import { Base } from "../../ui/MainLayout.js";
import { Main } from "./Main.js";
import { Map } from "./Map.js";
import { News } from "./News.js";
import { Virus } from "./Virus.js";

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

class Router {
    routes;
    constructor(props) {

    }
    addRoute(route, view) {}
    setRoutes(routes) { }
    moveTo(route) {}
}

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
    views = {
        main: new Main(),
        news: new News(),
        virus: new Virus(),
        map: new Map(),
    }
    constructor(props) {
        this.sideBar = new Sidebar();
        this.mainBase = new Base(null, [
            this.sideBar.content
        ]);
        this.create();
    }
    create() {
        this.root = this.mainBase.content;
        const sidebarItems = [
            cE('h2', {class: ['headerDiscover', 'size24']}, 'Главная'),
            sidebarItem({
                id: 'main',
                avatar: SVG('compass'),
                content: 'Обзор',
                click: () => {
                    this.sideBar.selectItem('main')
                    this.mainBase.updateMainContent([this.views.main.content]);
                }
            }),
            sidebarItem({
                id: 'news',
                avatar: SVG('news'),
                content: 'Новости',
                click: () => {
                    this.sideBar.selectItem('news')
                    this.mainBase.updateMainContent([this.views.news.content]);
                }
            }),
            sidebarItem({
                id: 'virus',
                avatar: SVG('virus'),
                content: 'COVID-19',
                click: () => {
                    this.sideBar.selectItem('virus')
                    this.mainBase.updateMainContent([this.views.virus.content]);
                }
            }),
            sidebarItem({
                id: 'map',
                avatar: SVG('map'),
                content: 'Карта',
                click: () => {
                    this.sideBar.selectItem('map')
                    this.mainBase.updateMainContent([this.views.map.content]);
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
        this.sideBar.selectItem('main');
        this.mainBase.updateMainContent([this.views.main.content]);
        this.initialized = true;
    }
}