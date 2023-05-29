export function toFixedNumber(num, digits, base) {
	const pow = Math.pow(base ?? 10, digits);
	return Math.round(num * pow) / pow;
}