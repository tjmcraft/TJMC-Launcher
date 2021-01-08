/**
 * The Function animates element
 * @param {Object} options - The options for animation
 * @param {Number} options.duration - The duration of animation
 * @param {Number} options.delay - The delay between keyframes
 * @param {Number} options.progress - The start point of progress
 * @param {Function} options.delta - The function that calls while progress
 * @param {Function} options.step - The function that calls each step of animation
 * @param {Function} options.complete - The function that calls after all animation complete
 */
function animate(options) {
    let start = new Date
    let id = setInterval(() => {
        let timePassed = new Date - start
        let progress = timePassed / options.duration
        if (progress > 1) progress = 1
        options.progress = progress
        let delta = options.delta(progress)
        options.step(delta)
        if (progress == 1) {
            clearInterval(id)
            options.complete()
        }
    }, options.delay || 10)
}

/**
 * The Function animates object from opacity 1 to 0
 * @param {Object} options - The options of animation
 * @param {Number} options.duration - The duration of animation 
 * @param {Function} options.complete - The callback function after all animation complete
 */
Element.prototype.fadeOut = function(options) {
    let element = this
    animate({
        duration: options.duration,
        delta: function(progress) {
            progress = this.progress
            return easing.swing(progress)
        },
        step: function(delta) {
            element.style.opacity = 1 - delta
        },
        complete: options.complete
    })
}

/**
 * The Function animates object from opacity 0 to 1
 * @param {Object} options - The options of animation
 * @param {Number} options.duration - The duration of animation 
 * @param {Function} options.complete - The callback function after all animation complete
 */
Element.prototype.fadeIn = function(options) {
    let element = this
    animate({
        duration: options.duration,
        delta: function(progress) {
            progress = this.progress
            return easing.swing(progress)
        },
        step: function(delta) {
            element.style.opacity = 0 + delta
        },
        complete: options.complete
    })
}

/* ======== All Easings ======== */
let easing = {
    linear (progress) {
        return progress;
    },
    quadratic (progress) {
        return Math.pow(progress, 2);
    },
    swing (progress) {
        return 0.5 - Math.cos(progress * Math.PI) / 2;
    },
    circ (progress) {
        return 1 - Math.sin(Math.acos(progress));
    },
    back (progress, x) {
        return Math.pow(progress, 2) * ((x + 1) * progress - x);
    },
    bounce (progress) {
        for (var a = 0, b = 1, result; 1; a += b, b /= 2) {
            if (progress >= (7 - 4 * a) / 11) {
                return -Math.pow((11 - 6 * a - 11 * progress) / 4, 2) + Math.pow(b, 2);
            }
        }
    },
    elastic (progress, x) {
        return Math.pow(2, 10 * (progress - 1)) * Math.cos(20 * Math.PI * x / 3 * progress);
    }
}
