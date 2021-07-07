export class Main {
    constructor(props) {
        this.create();
        this.update();
    }
    create() {
        this.root = cE('iframe', {
            src: 'https://www.tjmcraft.ga',
            seamless: true,
            style: 'width: 100%;height: 100%;'
        });
    }
    get content() {
        return this.root;
    }
    update() { }
}