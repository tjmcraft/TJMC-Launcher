/**
 * Function returns current preferred color sheme
 * @returns scheme
 */
export function getPreferredColorScheme() {
    if (window.matchMedia) {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        } else {
            return 'light';
        }
    }
    return 'light';
}

export async function getConfig() {
    if (window.__STANDALONE__ && electron) {
        return await electron.invoke('configuration.get');
    } else {
        return await fetchData('http://localhost:5248/configuration.get');
    }
}
export async function setConfig(config) {
    if (window.__STANDALONE__ && electron) {
        return await electron.invoke('configuration.set', config);
    } else {
        return await postData('http://localhost:5248/configuration.set', config);
    }
}
export async function getMem() {
    if (window.__STANDALONE__ && electron) {
        return await electron.invoke('system.mem');
    } else {
        return await fetchData('http://localhost:5248/system.mem');
    }
}
export async function getInstallations() {
    if (window.__STANDALONE__ && electron) {
        return await electron.invoke('installations.get')
    } else {
        return await fetchData('http://localhost:5248/installations.get');
    }
}
export async function getGlobalVersions() {
    if (window.__STANDALONE__ && electron) {
        return await electron.invoke('versions.get.global');
    } else {
        return await fetchData('http://localhost:5248/versions.get.global');
    }
}
export async function createInstallation(version, options) {
    if (window.__STANDALONE__ && electron) {
        return await electron.invoke('installations.create', version, options);
    } else {
        return await postData('http://localhost:5248/installations.create', { version, options });
    }
}

async function fetchData(url = '') {
    const response = await fetch(url);
    return await response.json();
}

async function postData(url = '', data = {}) {
    const response = await fetch(url, {
        method: 'POST', 
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data) 
    });
    return await response.json();
}