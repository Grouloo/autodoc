export type Reference = {
	collection: string
	id: string
}

export function createReference(collection: string, id: string): Reference {
	return {
		collection,
		id,
	}
}
