/**
 * 
 * @param {Object} props - Properties for the element
 * @param {Object} props.id - ID for the element
 * @param {Object} props.value - Value for the element
 * @param {Object} props.min - Minimum value for the element
 * @param {Object} props.max - Maximum value for the element
 * @param {Object} props.step - Step value for the element
 * @param {Object} props.action - Action after mouseup
 * @returns 
 */
function slider(props = {}) {
    props.id = props.id || randomString(5);
    props.value = props.value || 0;
    props.min = props.min || 0;
    props.max = props.max || 100;
    props.step = props.step || 1;

    const bar = createElement('div', { class: 'slider-bar' });
    const track_grabber = createElement('div', { class: 'grabber' });
    const track = createElement('div', { class: 'slider-track' }, track_grabber);
    const slider = createElement('div', { class: 'slider', id: props.id, value: props.value, min: props.min, max: props.max, step: props.step }, bar, track);

    let updateRangedSlider = (element, value, notch) => {
        const oldVal = element.getAttribute('value')
        element.setAttribute('value', value)
        track_grabber.tooltip(value)

        if(notch <= 0){
            notch = 0
        } else if(notch >= 100) {
            notch = 100
        }

        const event = new MouseEvent('change', {
            target: element,
            type: 'change',
            bubbles: false,
            cancelable: true
        })

        let cancelled = !element.dispatchEvent(event)

        if(!cancelled){
            track_grabber.style.left = notch + '%'
            bar.style.width = notch + '%'
        } else {
            element.setAttribute('value', oldVal)
        }
    }

    let calculateRangeSliderMeta = (v) => {
        const val = {
            max: Number(v.getAttribute('max')),
            min: Number(v.getAttribute('min')),
            step: Number(v.getAttribute('step')),
        }
        val.ticks = (val.max-val.min)/val.step
        val.inc = 100/val.ticks
        return val
    }

    track.onmousedown = (e) => {

        document.onmouseup = (e) => {
            document.onmousemove = null
            document.onmouseup = null
        }

        document.onmousemove = (e) => {
            const pos = getPos(track);
            const diff = e.pageX - pos.left
            let perc = (diff / track.offsetWidth) * 100
            if (perc <= 0) perc = 0
            if (perc >= 100) perc = 100

            const notch = Number(perc/sliderMeta.inc).toFixed(0)*sliderMeta.inc

            if (Math.abs(perc - notch) < sliderMeta.inc / 2) {
                updateRangedSlider(slider, sliderMeta.min + (sliderMeta.step * (notch / sliderMeta.inc)), notch)
            }
            
        }
    }

    slider.onchange = (e) => {
        // Current range values
        const sMaxV = Number(slider.getAttribute('value'))

        // Get reference to range bar.
        const bar = e.target.getElementsByClassName('slider-bar')[0]
        // Calculate effective total memory.
        const max = (1000000000000-1000000000)/1000000000

    }

    const value = slider.getAttribute('value')
    const sliderMeta = calculateRangeSliderMeta(slider)
    updateRangedSlider(slider, value, ((value-sliderMeta.min)/sliderMeta.step)*sliderMeta.inc)

    return slider;
}