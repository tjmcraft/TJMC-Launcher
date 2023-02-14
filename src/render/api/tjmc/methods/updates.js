import { fetchData } from "Util/Fetch";

let onUpdate;

export function init(_onUpdate) {
	onUpdate = _onUpdate;
}

export async function fetchReleases() {
	let result;
	try {
		result = await fetchData(API_URL + "/api/releases");
		if (!result || !result.response || result.error) {
			return false;
		}
	} catch (e) {
		return;
	}
	onUpdate({
		type: "updateReleases",
		releases: result.response
	});
	return result;
}