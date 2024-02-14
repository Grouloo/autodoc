type Operator = '=' | 'in'

export class Select<T> {
	protected filters: { field: string; operator: Operator; value: unknown }[] =
		[]
	protected sortings: { field: string; order: 'ASC' | 'DESC' }[] = []

	static from<T>() {
		return new this<T>()
	}

	get Filters() {
		return this.filters
	}

	get Sortings() {
		return this.sortings
	}

	where(field: keyof T, op: Operator, value: T[keyof T]) {
		this.filters.push({
			field: field as string,
			operator: op,
			value,
		})
		return this
	}

	whereStateIs(...states: ('_state' extends keyof T ? T['_state'] : never)[]) {
		this.filters.push({
			field: '_state',
			operator: 'in',
			value: states,
		})
		return this
	}

	sortBy(field: keyof T, order: 'ASC' | 'DESC') {
		this.sortings.push({ field: field as string, order })
		return this
	}
}
