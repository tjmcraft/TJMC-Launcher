export class Virus {
    constructor(props) {
        this.create();
        this.update();
    }
    create() {
        this.root = cE('iframe', {
            src: 'https://www.tjmcraft.ga/coronavirus',
            seamless: true,
            style: 'width: 100%;height: 100%;'
        });
    }
    get content() {
        return this.root;
    }
    update() {}
}