export class UnexpectedError extends Error {}

export class BadRequest extends Error {}

export class Unauthorized extends Error {}

export class Forbidden extends Error {}

export class NotFound extends Error {}

export class Gone extends Error {}

export class AlreadyPersisted extends Error {
	static new() {
		return new AlreadyPersisted()
	}
}
