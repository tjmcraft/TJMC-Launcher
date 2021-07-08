import { SVG } from "../../scripts/svg.js";
import { Base } from "../../ui/MainLayout.js";

class Sidebar {
    constructor(props) {
        this.create();
    }
    create() {
        this.root = cE('div', {
            class: ['scroller', 'thin-s']
        });
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

export class ChatContainer {
    initialized = false;
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
            cE('h2', {
                class: ['headerDiscover', 'size24']
            }, 'Сообщения')
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