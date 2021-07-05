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

export function setColorScheme(colorScheme = null) {
    console.log(colorScheme)
    switch (colorScheme) {
        case 'light':
            document.documentElement.classList.toggle('light-theme', true)
            document.documentElement.classList.toggle('dark-theme', false)
            break;
        case 'dark':
            document.documentElement.classList.toggle('dark-theme', true)
            document.documentElement.classList.toggle('light-theme', false)
            break;
        default:
            break;
    }
}

export const updateTheme = (system = null) => {
    const userTheme = window.localStorage.theme;
    const defaultTheme = 'dark';
    setColorScheme(userTheme || system || getPreferredColorScheme() || defaultTheme);
}

export const updatePlatform = (system = null) => {
    const defaultPlatform = 'web';
    switch (system || defaultPlatform) {
        case 'windows':
            document.documentElement.classList.toggle('platform-win', true)
            break;
        case 'osx':
            document.documentElement.classList.toggle('platform-darwin', true)
            break;
        case 'linux':
            document.documentElement.classList.toggle('platform-linux', true)
            break;
        default:
            document.documentElement.classList.toggle('platform-web', true)
            break;
    }
}

export const isWeb = !(window.__STANDALONE__ && electron);

export const randomInteger = (max) => {
    let min = 0
    let rand = min + Math.random() * (max + 1 - min)
    return Math.floor(rand)
}

export const randomString = (length) => {
    var result           = ''
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var charactersLength = characters.length
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
}

/* ============== Fetches ============== */

/**
 * Fetch JSON data from given URL
 */
async function fetchData(url = '') {
    const response = await fetch(url);
    return await response.json();
}

/**
 * Post data to given URL
 */
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

/* ============== ------- ============== */


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
export async function startMinecraft(version_hash, params = null) {
    console.log(`Starting minecraft with hash: ${version_hash}`);
    if (window.__STANDALONE__ && electron) {
        return await electron.invoke('launch-mine', version_hash);
    } else {
        return await postData('http://localhost:5248/launch-mine', { version_hash, params });
    }
}
export async function setProgressBar(progress) {
    if (window.__STANDALONE__ && electron) {
        return await electron.invoke('set.progress.bar', progress);
    } else {
        return ;
    }
}

