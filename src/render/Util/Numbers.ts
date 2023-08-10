export function toFixedNumber(num, digits, base = 10) {
	const pow = Math.pow(base, digits);
	return Math.round(num * pow) / pow;
}