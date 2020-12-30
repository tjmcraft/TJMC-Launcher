const fs = require('fs');

class message {
    constructor(params) {
        if (document.querySelector('#overlay')) {
            document.querySelector('#overlay').toggle();
            setTimeout(() => {
                document.querySelector('#overlay').remove();
            }, 1000);
        }

        this.overlay = this.createElementWithId('div', 'overlay');
        this.overlay.toggle(false);

        let container = this.createElementWithId('div', 'container');
        container.onclick = (event) => { event.stopPropagation(); };

        if (params.closeButton) {
            let tools = this.createToolsContainer();
            tools.querySelector('#overlayCloseButton').onclick = () => {
                this.destroy();
            };
            container.append(tools);
        }

        if (params.type) {
            let path = null;
            switch (params.type) {
                case 'info':
                    path = './app/assets/css/info-circle.svg';
                    break;
                case 'error':
                    path = './app/assets/css/error-circle.svg';
                    break;
                case 'warn':
                    path = './app/assets/css/warn-circle.svg';
                    break;
                case 'success':
                    path = './app/assets/css/success-circle.svg';
                    break;
                default:
                    path = '';
                    break;
            }

            let data = fs.readFileSync(path, 'utf8');

            let img = document.createElement('h2');
            img.innerHTML = data;

            container.append(img);
        }

        if (params.header) {
            let h = document.createElement('h1');
            h.innerText = params.header;
            container.append(h);
        }

        if (params.text) {
            let p = document.createElement('p');
            p.innerText = params.text;
            container.append(p);
        }

        if (params.okButton) {
            let button = this.createElementWithClass('button', 'okButton');
            button.innerText = 'Ок';
            button.onclick = () => {
                if (params.callback && typeof params.callback === 'function') {
                    params.callback();
                }
                this.destroy();
            };
            container.append(button);
        }

        this.overlay.onclick = (e) => {
            this.destroy();
        };

        document.onkeydown = (evt) => {
            evt = evt || window.event;
            let isEscape = false;
            if ("key" in evt) {
                isEscape = (evt.key === "Escape" || evt.key === "Esc");
            } else {
                isEscape = (evt.keyCode === 27);
            }
            if (isEscape) {
                this.destroy();
            }
        };

        this.overlay.append(container);

        document.body.appendChild(this.overlay);
        setTimeout(() => {
            this.overlay.toggle(true);
        });

        return this.overlay;
    }

    createElementWithId(el, id) {
        let e = document.createElement(el);
        e.id = id;
        return e;
    }

    createElementWithClass(el, cl) {
        let e = document.createElement(el);
        e.className = cl;
        return e;
    }

    createToolsContainer() {
        let tools = this.createElementWithClass('div', 'tools');
        let cont = this.createElementWithClass('div', 'container');

        let overlayCloseButton = this.createElementWithId('div', 'overlayCloseButton');

        let img = document.createElement('img');
        img.src = "./assets/css/cross.svg";

        let keycode = this.createElementWithClass('div', 'keycode');
        keycode.innerText = 'ESC';

        overlayCloseButton.append(img);
        cont.innerHTML += overlayCloseButton.outerHTML + keycode.outerHTML;

        tools.append(cont);

        return tools;
    }

    destroy() {
        this.overlay.toggle(false);
        setTimeout(() => {
            this.overlay.remove();
        }, 500);
    }
}

module.exports = message