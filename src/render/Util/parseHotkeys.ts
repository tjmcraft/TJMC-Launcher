export type KeyboardModifiers = {
  alt: boolean;
  ctrl: boolean;
  meta: boolean;
  mod: boolean;
  shift: boolean;
};

export type Hotkey = KeyboardModifiers & {
  key?: string;
};

type CheckHotkeyMatch = (event: KeyboardEvent) => boolean;

export function parseHotkey(hotkey: string): Hotkey {
  const keys = hotkey
    .toLowerCase()
    .split('+')
    .map((part) => part.trim());

  const modifiers: KeyboardModifiers = {
    alt: keys.includes('alt'),
    ctrl: keys.includes('ctrl'),
    meta: keys.includes('meta'),
    mod: keys.includes('mod'),
    shift: keys.includes('shift'),
  };

  const reservedKeys = ['alt', 'ctrl', 'meta', 'shift', 'mod'];

  const freeKey = keys.find((key) => !reservedKeys.includes(key));

  return {
    ...modifiers,
    key: freeKey,
  };
}

function isExactHotkey(hotkey: Hotkey, event: KeyboardEvent): boolean {
  const {
    alt, ctrl, meta, mod, shift, key,
  } = hotkey;
  const {
    altKey, ctrlKey, metaKey, shiftKey, key: pressedKey,
  } = event;

  if (key) {
    if (alt !== altKey) {
      return false;
    }
    if (mod) {
      if (!ctrlKey && !metaKey) {
        return false;
      }
    } else {
      if (ctrl !== ctrlKey) {
        return false;
      }
      if (meta !== metaKey) {
        return false;
      }
    }
    if (shift !== shiftKey) {
      return false;
    }
    return Boolean(pressedKey.toLowerCase() === key.toLowerCase() ||
      event.code.replace('Key', '').toLowerCase() === key.toLowerCase());
  } else {
    if (alt && event.key.toLowerCase() == 'alt') {
      return true;
    }
    if (mod) {
      if (event.key.toLowerCase() == 'control' || event.key.toLowerCase() == 'meta') {
        return true;
      }
    } else {
      if (ctrl && event.key.toLowerCase() == 'control') {
        return true;
      }
      if (meta && event.key.toLowerCase() == 'meta') {
        return true;
      }
    }
    if (shift && event.key.toLowerCase() == 'shift') {
      return true;
    }
  }

  return false;
}

export function getHotkeyMatcher(hotkey: string): CheckHotkeyMatch {
  return (event) => isExactHotkey(parseHotkey(hotkey), event);
}
