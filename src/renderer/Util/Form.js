
const serialize = (form) => {
    const formEntries = new FormData(form).entries();
    return Object.assign(...Array.from(formEntries, ([x,y]) => ({[x]:y})));
}

const serializeForm = (form) => {
    let obj = {};
    let formData = new FormData(form);
    for (const key of formData.keys()) {
        obj[key] = formData.get(key);
    }
    return obj;
}

export { serializeForm, serialize }