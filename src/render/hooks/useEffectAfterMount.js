import React, { useEffect, useRef } from 'react';

export default function useEffectAfterMount(effect, deps = []) {
	const isMounted = useRef(false);

	useEffect(() => {
		if (isMounted.current) return effect();
		else isMounted.current = true;
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [effect, ...deps]);

	// reset on unmount; in React 18, components can mount again
	useEffect(() => {
		isMounted.current = false;
	});
}