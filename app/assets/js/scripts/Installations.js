import { getInstallations } from "./Tools.js";

/**
 * All Installations
 */
export var Installations

/**
 * Get installation by versionHash
 * @param {String} version_hash - Version hash of the installation
 * @returns {Object}
 */
export async function getInstallation(version_hash) {
    if (Installations && Object(Installations).hasOwnProperty(version_hash)) 
        return { hash: version_hash, ...Installations[version_hash] } || null;
}

/**
 * Get current versionHash of installation
 * @returns {String}
 */
export async function getCurrentVersionHash() {
    return localStorage.version_hash || null;
}

/**
 * Set version hash of installation
 * @param {String} version_hash 
 * @returns {*}
 */
export async function setCurrentVersionHash(version_hash) {
    return localStorage.version_hash = version_hash || null;
}

export async function refreshInstallations() {
    Installations = await getInstallations();
    return Installations;
}