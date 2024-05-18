const matchColorScheme = (callback = () => { }) => {
	const colorScheme = window.matchMedia('(prefers-color-scheme: dark)'); // Current web color scheme [browser]
	colorScheme.addEventListener('change', () => callback()); // Register new eventListener for colorScheme change [browser]
	return colorScheme.matches;
};

export { matchColorScheme };