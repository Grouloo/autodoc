import { union, type InferUnion } from 'shulk'

export const FieldConfig = union<{
	Text: {}
}>()
export type FieldConfig = InferUnion<typeof FieldConfig>

export type FormDefinition<T> = {
	[x in keyof T]: {
		label: string
		config: FieldConfig['Text']
	}
}
