export class Guilds {
    constructor() {
        this.guilds = cE('nav', { class: 'guilds' },
            cE('ul', { class: 'tree' },
                cE('div', { class: ['scroller', 'no-scrollbar'] },
                    this.createListElement(
                        cE('img', {
                            src: `https://picsum.photos/48/48?h=11`
                        }),
                        { onclick: (e) => { console.log(22) } }
                    ),
                    this.createListElement(
                        cE('img', {
                            src: `https://picsum.photos/48/48?h=22`
                        })
                    ),
                    this.createListElement(
                        cE('img', {
                            src: `https://picsum.photos/48/48?h=33`
                        })
                    ),
                    this.createSeparator(),
                    this.createListElement(
                        cE('img', {
                            src: `https://picsum.photos/48/48?h=2`
                        })
                    ),
                    this.createListElement(
                        cE('img', {
                            src: `https://picsum.photos/48/48?h=3`
                        })
                    ),
                    this.createListElement(
                        cE('img', {
                            src: `https://picsum.photos/48/48?h=4`
                        })
                    ),
                    this.createListElement(
                        cE('img', {
                            src: `https://picsum.photos/48/48?h=5`
                        })
                    ),
                    this.createListElement(
                        cE('img', {
                            src: `https://picsum.photos/48/48?h=6`
                        })
                    ),
                )
            )
        );
        /*this.guilds = `
        <nav class="guilds">
            <ul class="tree">
                <div class="scroller no-scrollbar">
                    <!--<div class="listItem">
                        <div class="wrapper">
                            <div class="singleIconBtn">
                                <svg viewBox="0 0 576 512"><path fill="currentColor" d="M280.37 148.26L96 300.11V464a16 16 0 0 0 16 16l112.06-.29a16 16 0 0 0 15.92-16V368a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v95.64a16 16 0 0 0 16 16.05L464 480a16 16 0 0 0 16-16V300L295.67 148.26a12.19 12.19 0 0 0-15.3 0zM571.6 251.47L488 182.56V44.05a12 12 0 0 0-12-12h-56a12 12 0 0 0-12 12v72.61L318.47 43a48 48 0 0 0-61 0L4.34 251.47a12 12 0 0 0-1.6 16.9l25.5 31A12 12 0 0 0 45.15 301l235.22-193.74a12.19 12.19 0 0 1 15.3 0L530.9 301a12 12 0 0 0 16.9-1.6l25.5-31a12 12 0 0 0-1.7-16.93z" class=""></path></svg>
                            </div>
                        </div>
                    </div>-->


                    <div class="listItem" data-name="play">
                        <div class="wrapper">
                            <div class="singleIconBtn">
                                <svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="play-circle" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-play-circle fa-w-16 fa-7x"><path fill="currentColor" d="M371.7 238l-176-107c-15.8-8.8-35.7 2.5-35.7 21v208c0 18.4 19.8 29.8 35.7 21l176-101c16.4-9.1 16.4-32.8 0-42zM504 256C504 119 393 8 256 8S8 119 8 256s111 248 248 248 248-111 248-248zm-448 0c0-110.5 89.5-200 200-200s200 89.5 200 200-89.5 200-200 200S56 366.5 56 256z" class=""></path></svg>
                            </div>
                        </div>
                    </div>
                    <div class="listItem" data-name="user">
                        <div class="wrapper">
                            <div class="singleIconBtn">
                            <svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="user-circle" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" class="svg-inline--fa fa-user-circle fa-w-16 fa-7x"><path fill="currentColor" d="M248 104c-53 0-96 43-96 96s43 96 96 96 96-43 96-96-43-96-96-96zm0 144c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48zm0-240C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm0 448c-49.7 0-95.1-18.3-130.1-48.4 14.9-23 40.4-38.6 69.6-39.5 20.8 6.4 40.6 9.6 60.5 9.6s39.7-3.1 60.5-9.6c29.2 1 54.7 16.5 69.6 39.5-35 30.1-80.4 48.4-130.1 48.4zm162.7-84.1c-24.4-31.4-62.1-51.9-105.1-51.9-10.2 0-26 9.6-57.6 9.6-31.5 0-47.4-9.6-57.6-9.6-42.9 0-80.6 20.5-105.1 51.9C61.9 339.2 48 299.2 48 256c0-110.3 89.7-200 200-200s200 89.7 200 200c0 43.2-13.9 83.2-37.3 115.9z" class=""></path></svg>
                            </div>
                        </div>
                    </div>
                    <div class="listItem" data-name="friends">
                        <div class="wrapper">
                            <div class="singleIconBtn">
                            <svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="users" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="svg-inline--fa fa-users fa-w-20 fa-7x"><path fill="currentColor" d="M544 224c44.2 0 80-35.8 80-80s-35.8-80-80-80-80 35.8-80 80 35.8 80 80 80zm0-112c17.6 0 32 14.4 32 32s-14.4 32-32 32-32-14.4-32-32 14.4-32 32-32zM96 224c44.2 0 80-35.8 80-80s-35.8-80-80-80-80 35.8-80 80 35.8 80 80 80zm0-112c17.6 0 32 14.4 32 32s-14.4 32-32 32-32-14.4-32-32 14.4-32 32-32zm396.4 210.9c-27.5-40.8-80.7-56-127.8-41.7-14.2 4.3-29.1 6.7-44.7 6.7s-30.5-2.4-44.7-6.7c-47.1-14.3-100.3.8-127.8 41.7-12.4 18.4-19.6 40.5-19.6 64.3V432c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48v-44.8c.2-23.8-7-45.9-19.4-64.3zM464 432H176v-44.8c0-36.4 29.2-66.2 65.4-67.2 25.5 10.6 51.9 16 78.6 16 26.7 0 53.1-5.4 78.6-16 36.2 1 65.4 30.7 65.4 67.2V432zm92-176h-24c-17.3 0-33.4 5.3-46.8 14.3 13.4 10.1 25.2 22.2 34.4 36.2 3.9-1.4 8-2.5 12.3-2.5h24c19.8 0 36 16.2 36 36 0 13.2 10.8 24 24 24s24-10.8 24-24c.1-46.3-37.6-84-83.9-84zm-236 0c61.9 0 112-50.1 112-112S381.9 32 320 32 208 82.1 208 144s50.1 112 112 112zm0-176c35.3 0 64 28.7 64 64s-28.7 64-64 64-64-28.7-64-64 28.7-64 64-64zM154.8 270.3c-13.4-9-29.5-14.3-46.8-14.3H84c-46.3 0-84 37.7-84 84 0 13.2 10.8 24 24 24s24-10.8 24-24c0-19.8 16.2-36 36-36h24c4.4 0 8.5 1.1 12.3 2.5 9.3-14 21.1-26.1 34.5-36.2z" class=""></path></svg>
                            </div>
                        </div>
                    </div>
                    <div class="listItem">
                        <div class="guildSeparator"></div>
                    </div>
                    ${[...Array(20).keys()].map(e => {
                        let el = createElement('img', {src: `https://picsum.photos/48/48?h=${e}`});
                        return this.createListElement(el).outerHTML;
                    }).join('')}
                    <div class="listItem">
                        <div class="wrapper">
                            <div class="singleIconBtn">
                            <svg width="24" height="24" viewBox="0 0 18 18"><polygon fill-rule="nonzero" fill="currentColor" points="15 10 10 10 10 15 8 15 8 10 3 10 3 8 8 8 8 3 10 3 10 8 15 8"></polygon></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </ul>
        </nav>
        `;*/
    }

    get content(){
        return this.guilds || "";
    }

    createListItem(...c) {
        return cE('div', {class: 'listItem'}, ...c);
    }

    createListElement(c, props) {
        const root = cE('div', { class: 'wrapper' }, c);
        props?.onclick && (root.onclick = props.onclick);
        return this.createListItem(root);
    }

    createSeparator() {
        return this.createListItem(cE('div', { class: ['guildSeparator'] }));
    }
}