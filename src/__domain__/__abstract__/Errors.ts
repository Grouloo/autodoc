export class UnexpectedError extends Error {}

export class BadRequest extends Error {}

export class Unauthorized extends Error {}

export class Forbidden extends Error {}

export class NotFound extends Error {}

export class Gone extends Error {}

export class AlreadyPersisted extends Error {
	protected id: string

	constructor(id: string) {
		super()
		this.id = id
	}

	get Id() {
		return this.id
	}

	static new(id: string) {
		return new AlreadyPersisted(id)
	}
}
