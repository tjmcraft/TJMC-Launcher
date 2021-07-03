import { getConfig } from "./scripts/Tools.js";

class AppContainer {

    /**
     * Root content
     */
    root
    
    constructor(props) {
        this.appLayers = cE('div', { class: ['app-layers'] });
        this.uploadArea = cE('div', { class: ['uploadArea'] });
        this.create();
        this.update();
    }
    create() {
        this.root = cE('div', { class: ['app-container'] }, 
            this.appLayers,
            this.uploadArea
        );
    }
    get content() {
        return this.root;
    }
    update() {}
}

class Preloader {

    /**
     * Root content
     */
    root

    constructor(props) {
        this.background = cE('img', { class: ['background'], src: "https://picsum.photos/1920/1080" });
        /*this.logo = cE('img', { src: './assets/images/icon.png', 'data-type': 'logo' });
        this.circles = [
            cE('div', { class: ['circle'] }),
            cE('div', { class: ['circle'], style: 'animation-delay: .9s !important'})
        ];*/
        this.title = cE('div', { class: ['title'] });
        this.subtitle = cE('div', { class: ['subtitle'] }, 'TJMCRAFT');
        
        this.create();
        this.update();
    }
    create() {
        this.root = cE('div', { class: ['preloader'] },
            this.title,
            this.background,
            this.subtitle
            //this.logo,
            //...this.circles
        );
    }
    destroy() {
        this.root.fadeOut(300, () => {
            this.root.remove();
            document.documentElement.classList.remove('preload');
        })
    }
    get content() {
        return this.root;
    }
    async update() {
        const config = await getConfig();
        this.title.removeAllChildNodes();
        this.title.appendChild(this.Greeting(this.Time, config?.auth?.username));
    }
    Greeting(time, name = null) {
        if (name) {
            return cE('span', null, 
                time, ",",
                cE('br'),
                name, "!"
            )
        } else {
            return cE('span', null, 
                time, "!"
            )
        }
    }
    get Time() {
        let hour = new Date().getHours();
        let greeting;
        if (hour >= 5 && hour < 12)
            greeting = "Доброе утро";
        else if (hour >= 12 && hour < 18)
            greeting = "Добрый день";
        else if (hour >= 18 && hour < 24)
            greeting = "Добрый вечер";
        else if (hour >= 0 && hour < 5)
            greeting = "Доброй ночи";
        return greeting || "";
    }

}

class App {

    /**
     * Root content
     */
    root

    constructor(props) {
        this.appContainer = new AppContainer();
        this.preloader = new Preloader();
        this.create();
        this.update();
    }
    create() {
        this.root = cE('div', { class: ['app'] },
            this.preloader.content,
            this.appContainer.content,
            
        )
    }
    get content() {
        return this.root;
    }
    update() {}
}

class LayerContainer {
    
    /**
     * Root content
     */
    root

    constructor(props) {
        this.create();
        this.update();
    }
    create() {
        this.root = cE('div', { class: ['layerContainer'] })
    }
    get content() {
        return this.root;
    }
    update() {}
}

async function init(props) {
    const mount = qsl(`#app-mount`);
    const app = new App();
    const layerContainer = new LayerContainer();
    mount.append(app.content, layerContainer.content);
    window.addEventListener('load', () => {
        mount.toggle(true, 'app-mount')
        setTimeout(() => app.preloader.destroy(), 2500)
    }, { once: true });
    
}

init();