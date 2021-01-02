'use strict'
const components = document.querySelectorAll('#js-component')

const loadComponent = async (c) => {
    c.outerHTML = await (await fetch(c.dataset.src)).text()
}

[...components].forEach(loadComponent)