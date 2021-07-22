'use strict';
const ConfigManager = require('../managers/ConfigManager');
const path = require('path');
const fs = require('fs');
const electron = require('electron');
const logg = require('../util/loggerutil')('%c[WindowState]', 'color: #d59215; font-weight: bold');

module.exports = function (config) {
    loadWindowState();
    const screen = electron.screen || electron.remote.screen;
    let state, winRef;

    function isNormal(win) {
        return !win.isMinimized() && !win.isMaximized() && !win.isFullScreen()
    }

    function hasBounds() {
        return (
        state &&
        Number.isInteger(state.x) &&
        Number.isInteger(state.y) &&
        Number.isInteger(state.width) && state.width > 0 &&
        Number.isInteger(state.height) && state.height > 0
        )
    }

    function resetStateToDefault() {
        const displayBounds = screen.getPrimaryDisplay().bounds

        state = {
            width: config.width || 800,
            height: config.height || 600,
            x: 0,
            y: 0,
            displayBounds
        }
    }

    function windowWithinBounds(bounds) {
        return (
        state.x >= bounds.x &&
        state.y >= bounds.y &&
        state.x + state.width <= bounds.x + bounds.width &&
        state.y + state.height <= bounds.y + bounds.height
        )
    }

    function ensureWindowVisibleOnSomeDisplay() {
        const visible = screen.getAllDisplays().some(display => {
            return windowWithinBounds(display.bounds)
        })

        if (!visible) {
            return resetStateToDefault()
        }
    }

    function validateState() {
        const isValid = state && (hasBounds() || state.isMinimized ||state.isMaximized || state.isFullScreen)
        if (!isValid) {
            state = null
            return
        }

        if (hasBounds() && state.displayBounds) {
            ensureWindowVisibleOnSomeDisplay()
        }
    }

    function updateState(win) {
        win = win || winRef
        if (!win) return

        try {
            const winBounds = win.getBounds()
            if (isNormal(win)) {
                state.x = winBounds.x
                state.y = winBounds.y
                state.width = winBounds.width
                state.height = winBounds.height
            }
            state.isMinimized = win.isMinimized()
            state.isMaximized = win.isMaximized()
            state.isFullScreen = win.isFullScreen()
            state.displayBounds = screen.getDisplayMatching(winBounds).bounds
        } catch (err) {}
    }

    function saveState(win) {
        logg.info(state)
        if (win) updateState(win)
        setWindowState(state)
        saveWindowState()
    }

    function stateHandler() {
        updateState()
    }

    function closedHandler() {
        unmanage()
        saveState()
    }

    function manage(win) {
        if (state.isMinimized) {
            win.minimize()
        }
        if (state.isMaximized) {
            win.maximize()
        }
        if (state.isFullScreen) {
            win.setFullScreen(true)
        }
        win.on('resize', stateHandler)
        win.on('move', stateHandler)
        win.on('close', stateHandler)
        win.on('closed', closedHandler)
        winRef = win
    }

    function unmanage() {
        if (winRef) {
            winRef.removeListener('resize', stateHandler)
            winRef.removeListener('move', stateHandler)
            winRef.removeListener('close', stateHandler)
            winRef.removeListener('closed', closedHandler)
            winRef = null
        }
    }

    state = getWindowState()

    validateState()

    state = Object.assign({
        width: config.width || 800,
        height: config.height || 600
    }, state)

    return {
        get x() { return state.x },
        get y() { return state.y },
        get width() { return state.width },
        get height() { return state.height },
        get displayBounds() { return state.displayBounds },
        get isMaximized() { return state.isMaximized },
        get isMinimized() { return state.isMinimized },
        get isFullScreen() { return state.isFullScreen },
        saveState,
        unmanage,
        manage,
        resetStateToDefault
    }
}

/* =====================   Window Properties   ===================== */

const DEFAULT_WINDOW_CONFIG = {
    x: 0,
    y: 0,
    width: 1280,
    height: 720,
    isMaximized: false,
    isFullScreen: false
}

let windowStateConfigPath = path.join(ConfigManager.getLauncherDirectory(), 'window-config.json')
let windowConfig = null

const saveWindowState = function () {
    fs.writeFileSync(windowStateConfigPath, JSON.stringify(windowConfig, null, 4), 'UTF-8')
}

const loadWindowState = function () {
    let loaded = false
    if (!fs.existsSync(windowStateConfigPath)) {
        fs.mkdirSync(path.join(windowStateConfigPath, '..'), { recursive: true })
        loaded = true
        windowConfig = DEFAULT_WINDOW_CONFIG
        saveWindowState()
    }
    if (!loaded) {
        try {
            windowConfig = JSON.parse(fs.readFileSync(windowStateConfigPath, 'UTF-8')) 
        } catch (err) {
            logg.error(err)
            logg.log('Configuration file contains malformed JSON or is corrupt.')
            logg.log('Generating a new configuration file.')
            fs.mkdirSync(path.join(windowStateConfigPath, '..'), { recursive: true })
            windowConfig = DEFAULT_WINDOW_CONFIG
            saveWindowState()
        }
    }
    logg.log('Load window config - success')
}

const getWindowState = function () {
    return windowConfig
}

const setWindowState = function (state) {
    windowConfig = state
}