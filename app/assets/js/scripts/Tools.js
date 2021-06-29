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
    return await electron.invoke('configuration.get');
}
export async function setConfig(config) {
    return await electron.invoke('configuration.set', config);
}
export async function getMem() {
    return await electron.invoke('system.mem');
}