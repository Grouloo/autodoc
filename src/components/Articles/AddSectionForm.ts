import type { AddSectionForm } from '@__domain__/articles/commands'
import { FieldConfig, type FormDefinition } from '@components/Form'

export const addSectionForm: FormDefinition<AddSectionForm> = {
	title: {
		label: 'Section title',
		required: true,
		config: FieldConfig.Text({}),
	},
	source: {
		label: 'Source URL',
		placeholder: 'https://www.example.com',
		required: true,
		config: FieldConfig.URL({}),
	},
}
