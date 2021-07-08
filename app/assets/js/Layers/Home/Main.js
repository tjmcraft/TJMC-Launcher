export class Main {
    constructor(props) {
        this.create();
        this.update();
    }
    create() {
        this.root = cE('div', { class: ['pageWrapper'] },
            cE('div', { class: ['scroller-qw','auto-s'] },
                cE('div', { class: ['viewWrapper'] },
                    cE('div', { class: ['header-q'] },
                        cE('img', {
                            class: ['headerImage'],
                            src: "./assets/images/banner.jpg"
                        }),
                        cE('div', { class: ['headerContentWrapper'] },
                            cE('div', { class: ['headerContent'] },
                                cE('h2', { class: ['title', 'sizeZ'] }, 'ТюменьCraft'),
                                cE('h3', { class: ['subtitle', 'sizeQ'] }, 'Любите девушки, простых романтиков, отважных лётчиков и моряков...')
                            )
                        )
                    ),
                    cE('div', { class: ['main-q'] },
                        cE('div', { class: ['section'] },
                            cE('h3', null, 'Что происходит')
                        )
                    ),
                    cE('div', { class: ['footer-q'] }, 'footer'),
                )
            )
        )
    }
    get content() {
        return this.root;
    }
    update() { }
}