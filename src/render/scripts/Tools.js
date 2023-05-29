
window.getCookie = function (name) {
	let match = document.cookie.match(new RegExp(`(^| )${  name  }=([^;]+)`));
	if (match) return match[2];
};

export function getQueryParams() {
	const urlSearchParams = new URLSearchParams(window.location.search);
	return Object.fromEntries(urlSearchParams.entries());
}

/*function verifyScope(scope) {
    const valid_scopes = ['read', 'write'];
    const scopes = scope.replace(/\s+/g, '').split(',');
    return scopes.every(function (v) {
        return this.indexOf(v) != -1
    }, valid_scopes);
}*/

function sleep(milliseconds) {
	let start = new Date().getTime();
	for (let i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds) {
			break;
		}
	}
}