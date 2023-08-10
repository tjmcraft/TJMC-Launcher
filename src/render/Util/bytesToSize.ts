export default function bytesToSize(bytes = 0, isSpeed = false) {
	let sizes = isSpeed ? ['Байт/сек', 'Кб/сек', 'Мб/сек', 'Гб/сек', 'Тб/сек'] : ['Байт', 'Кб', 'Мб', 'Гб', 'Тб'];
	if (bytes == 0) return '0 Byte';
	let i = Math.floor(Math.log(bytes) / Math.log(1024));
	return `${Math.round(bytes / Math.pow(1024, i))  } ${  sizes[i]}`;
}