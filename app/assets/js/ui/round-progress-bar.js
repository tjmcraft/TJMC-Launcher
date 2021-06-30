
import { SVG } from '../scripts/svg.js';

export class progressBar {
    constructor(precentage = 0) {
        this.progress_circle = SVG('progress-circle');
        this.root = cE('div', { class: 'progress-container' }, this.progress_circle);
        this.setPrecentage(precentage);
    }
    setPrecentage(value) {
        var val = parseInt(value);
        var circle = this.progress_circle.qsl('#bar');
        if (isNaN(val)) {
            val = 100;
        } else {
            var r = circle.getAttribute('r');
            console.debug(r)
            var c = Math.PI * (r * 2);
            if (val < 0) val = 0;
            if (val > 100) val = 100;
            var pct = ((100 - val) / 100) * c;
            circle.style.strokeDashoffset = pct;
        }
    }
    get content() {
        return this.root;
    }
}