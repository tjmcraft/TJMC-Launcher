import { useEffect, useState } from 'react';
import { getHotkeyMatcher } from 'Util/parseHotkeys';
import useBackgroundMode from './useBackgroundMode';

const IGNORE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

export default function useReservedKey(hotkey) {
  const [isPressed, setIsPressed] = useState(false);
  useBackgroundMode(() => setIsPressed(false));
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!shouldFireEvent(e)) {
        return;
      }
      if (getHotkeyMatcher(hotkey)(e)) {
        setIsPressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (!shouldFireEvent(e)) {
        return;
      }
      setIsPressed(false);
    };
    document.documentElement.addEventListener('keydown', handleKeyDown);
    document.documentElement.addEventListener('keyup', handleKeyUp);
    return () => {
      document.documentElement.removeEventListener('keydown', handleKeyDown);
      document.documentElement.removeEventListener('keyup', handleKeyUp);
    }
  }, [hotkey]);
  return isPressed;
}

function shouldFireEvent(e: KeyboardEvent) {
  if (e.target instanceof HTMLElement) {
    return !IGNORE_TAGS.has(e.target.tagName);
  }
  return true;
}
