// @ts-nocheck
/**
 * Get Position of the element
 * @param {HTMLElement} element - The element to get position to
 */
export function getPos(element) {
	let x = 0,
		y = 0;
	while(element && !isNaN(element.offsetLeft) && !isNaN(element.offsetTop)) {
		x += element.offsetLeft - element.scrollLeft;
		y += element.offsetTop - element.scrollTop;
		element = element.offsetParent;
	}
	return { top: y, left: x };
}