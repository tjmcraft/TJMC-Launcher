
/* ============== Fetches ============== */

/**
 * Fetch JSON data from given URL
 * @param {String} url - URL to fetch
 * @param {Object} query - query parameters
 */
export async function fetchData(url = '', query = {}) {
	const response = await fetchWT(URLWithQuery(url, query),
		{
			method: 'GET',
			cache: 'no-cache',
		});
	return response;
}

/**
 * Post data to given URL
 * @param {string} url - URL to post
 * @param {object} query - query parameters
 * @param {object} data - data to post
 */
export async function postData(url = '', query = {}, data = {}) {
	const response = await fetchWT(URLWithQuery(url, query),
		{
			method: 'POST',
			cache: 'no-cache',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});
	return response;
}

export function URLWithQuery(url, query = {}) {
	const _params = new URLSearchParams(query).toString();
	return url + (query && _params ? `?${  _params}` : '');
}

async function fetchWT(url, user_options = {}) {
	const timeout = 3000;
	const controller = new AbortController();
	let options: RequestInit = { ...user_options, signal: controller.signal, credentials: 'include' };
	setTimeout(() => controller.abort(), timeout);
	let response;
	try {
		response = await fetch(url, options);
		return await response.json();
	} catch (err) {
		console.error("Failed to fetch", url, "=>", err);
		return;
	}
}