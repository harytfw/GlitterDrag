
export function formatDateWithZeroPadding(now: Date): string[] {
	const y = now.getFullYear().toString();
	const M = (now.getMonth() + 1).toString().padStart(2, "0");
	const d = now.getDate().toString().padStart(2, "0");
	const h = now.getHours().toString().padStart(2, "0");
	const m = now.getMinutes().toString().padStart(2, "0");
	const s = now.getSeconds().toString().padStart(2, "0");
	return [y, M, d, h, m, s]
}