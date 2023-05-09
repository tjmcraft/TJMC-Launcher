
/**
 * Function returns current preferred color scheme (in browser and system)
 * @returns scheme
 */
export default function getPreferredColorScheme() {
	if (window.matchMedia) {
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light";
	}
	return "dark";
}