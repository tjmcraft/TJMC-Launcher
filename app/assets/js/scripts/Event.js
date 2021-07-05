export class DOMEvent {
    constructor(event, ...data) {
        this.event = new CustomEvent(event, { ...data });
    }
    dispatchEvent(element = null) {
        element = element || window.document;
        element.dispatchEvent(this.event);
    }
}