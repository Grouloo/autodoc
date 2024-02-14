export type Percentage = number

export function createPercentage(val: number, total: number) {
	return (val / total) * 100
}
