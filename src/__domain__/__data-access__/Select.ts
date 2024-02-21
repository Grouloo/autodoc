import type { UnexpectedError } from '../__abstract__'
import type { AsyncResult } from 'shulk'
import type { DB } from './DB'

type Operator = '=' | 'in'

export class Select<T> {
	protected filters: { field: string; operator: Operator; value: unknown }[] =
		[]
	protected sortings: { field: string; order: 'ASC' | 'DESC' }[] = []

	constructor(
		protected db: DB,
		protected table: string,
		protected joins: string[],
	) {}

	static in<T>(db: DB, table: string, joins: string[]) {
		return new this<T>(db, table, joins)
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

	orderBy(field: keyof T, order: 'ASC' | 'DESC') {
		this.sortings.push({ field: field as string, order })
		return this
	}

	exec(): AsyncResult<UnexpectedError, T[]> {
		return this.db.query(this.table, this, this.joins)
	}
}
