'use strict'
const components = document.querySelectorAll('#include-component')

const loadComponent = async (c) => {
    c.outerHTML = await (await fetch(c.dataset.src)).text()
}

[...components].forEach(loadComponent)