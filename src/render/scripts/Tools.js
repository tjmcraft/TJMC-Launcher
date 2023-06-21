
window.getCookie = function (name) {
	let match = document.cookie.match(new RegExp(`(^| )${  name  }=([^;]+)`));
	if (match) return match[2];
};

export function getQueryParams() {
	const urlSearchParams = new URLSearchParams(window.location.search);
	return Object.fromEntries(urlSearchParams.entries());
}