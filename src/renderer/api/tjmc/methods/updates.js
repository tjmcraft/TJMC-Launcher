import { fetchData } from "Util/Fetch";

let onUpdate;

export function init(_onUpdate) {
	onUpdate = _onUpdate;
}

export async function fetchReleases() {
	let result;
	try {
		result = await fetchData("https://api.github.com/repos/tjmcraft/TJMC-Launcher/releases");
		if (!result || result.error) {
			return false;
		}
	} catch (e) {
		return;
	}
	onUpdate({
		type: "updateReleases",
		releases: result
	});
	return result;
}