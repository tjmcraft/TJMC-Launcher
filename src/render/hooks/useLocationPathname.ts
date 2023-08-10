import { useCallback, useEffect, useState } from "react";

const useLocatonPathname = () => {
	const [path, setPath] = useState(window.location.pathname);

	const navigate = useCallback(() => {
		setPath(window.location.pathname);
	}, [setPath]);

	useEffect(() => {
		window.addEventListener("navigate", navigate);
		return () => window.removeEventListener("navigate", navigate);
	});

	return path;
};

export default useLocatonPathname;