export function getData(data) {
	let date = new Date(data);
	let year = date.getFullYear();
	let month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
	let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
	let hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
	let minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
	let seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
	return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
}

export function getSize(value: number) {
	if (value > 1000000) return (value / 1000000).toFixed(1) + 'MB';
	else if (value > 1000) return (value / 1000).toFixed(1) + 'KB';
	else if (value < 1000) return value + 'B';
}