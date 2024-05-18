import { useState, useEffect, useRef } from 'react';

function useLocalStorageCache(key, defaultValue, toString, fromString) {
	const deserialize = (val) => {
		try {
			return fromString(val);
		} catch {
			return defaultValue();
		}
	};

	const initialCache = localStorage.getItem(typeof key === 'string' ? key : key.current);
	const [value, setValue] = useState(initialCache !== null ? deserialize(initialCache) : defaultValue());

	const keyRef = useRef(key);
	if (typeof key !== 'string') {
		keyRef.current = key;
	}

	useEffect(() => {
		if (typeof key !== 'string') {
			const newKey = key.current;
			const cache = localStorage.getItem(newKey);
			setValue(cache !== null ? deserialize(cache) : defaultValue());
		}
	}, [key]);

	useEffect(() => {
		localStorage.setItem(typeof key === 'string' ? key : key.current, toString(value));
	}, [value, key, toString]);

	useEffect(() => {
		const onStorage = (e) => {
			if (e.key === (typeof key === 'string' ? key : key.current)) {
				const newValue = deserialize(e.newValue ?? '');
				if (newValue !== value) {
					setValue(newValue);
				}
			}
		};

		window.addEventListener('storage', onStorage);
		return () => {
			window.removeEventListener('storage', onStorage);
		};
	}, [value, key, deserialize]);

	return [value, setValue];
}

export default useLocalStorageCache;