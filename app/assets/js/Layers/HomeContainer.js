
import { SVG } from "../scripts/svg.js";
import { MainBase } from "../ui/MainLayout.js";

export class HomeContainer {
    constructor(props) {
        this.sideBar = null;
        this.topContainer = null;
        this.mainBase = new MainBase([
            cE('div', { class: ['scroller', 'thin-s']},
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
            )
        ], [
            cE('iframe', { src: 'https://www.tjmcraft.ga', seamless: true, style: 'width: 100%;height: 100%;'})
        ]);
        this.create();
    }
    create() {
        this.root = this.mainBase.content;
    }
    get content() {
        return this.root;
    }
}