import type { WriteDescriptionForm } from '@__domain__/articles/commands'
import { FieldConfig, type FormDefinition } from '@components/Form'

export const writeDescriptonForm: FormDefinition<WriteDescriptionForm> = {
	description: {
		label: 'Description',
		required: true,
		config: FieldConfig.TextArea({}),
	},
}
