
import { useEffect, useState } from "react";
import useGlobal from "./useGlobal";
import getPreferredColorScheme from "Util/getPreferredColorScheme";
import { matchColorScheme } from "Util/colorScheme";

export default function useColorTheme() {
	const userTheme = useGlobal(global => global.theme);
	const [theme, setTheme] = useState((userTheme == "system" ? getPreferredColorScheme() : userTheme));
	useEffect(() => {
		function handleChange() {
			setTheme((userTheme == "system" ? getPreferredColorScheme() : userTheme));
		}
		matchColorScheme(handleChange);
	}, []);
	return theme;
}

