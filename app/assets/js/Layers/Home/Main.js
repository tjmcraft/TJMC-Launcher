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
                            cE('div', { class: ['grid-q'] },
                                cE('div', { class: ['row-q', 'imageLeft', 'container-z']},
                                    cE('img', {
                                        class: ['featureImage', 'lim'],
                                        src: 'https://discord.com/assets/46b2132c01604c9493d558de444929f4.svg'
                                    }),
                                    cE('div', { class: ['description'] },
                                        cE('h2', null, 'This is image left box'),
                                        cE('div', { class: ['subtitle', 'sizeQ'] }, 'Subtitle text for grid box. It can be longer and longer... But now it`s not'),
                                    )
                                )
                            ),
                            cE('div', { class: ['grid-q', 'grayBackground'] },
                                cE('div', { class: ['row-q', 'imageRight', 'container-z']},
                                    cE('img', {
                                        class: ['featureImage', 'lim'],
                                        src: 'https://discord.com/assets/46b2132c01604c9493d558de444929f4.svg'
                                    }),
                                    cE('div', { class: ['description'] },
                                        cE('h2', null, 'This is image right box'),
                                        cE('div', { class: ['subtitle', 'sizeQ'] }, 'Subtitle text for grid box. It can be longer and longer... But now it`s not'),
                                    )
                                )
                            ),
                            cE('div', { class: ['grid-q'] },
                                cE('div', { class: ['row-q', 'imageBottom', 'container-z']},
                                    cE('div', { class: ['description'] },
                                        cE('h2', null, 'This is image bottom box'),
                                        cE('div', { class: ['subtitle', 'sizeQ'] }, 'Subtitle text for grid box. It can be longer and longer... But now it`s not'),
                                    ),
                                    cE('img', {
                                        class: ['featureImage'],
                                        src: 'https://discord.com/assets/98ea5b9e92e304c7d352ac462996adc5.svg'
                                    })
                                )
                            )
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