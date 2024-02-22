import type { AddSectionPDFForm } from '@__domain__/articles/commands'
import { FieldConfig, type FormDefinition } from '@components/Form'

export const addSectionPDFForm: FormDefinition<AddSectionPDFForm> = {
	title: {
		label: 'Section title',
		required: true,
		config: FieldConfig.Text({}),
	},
	sourceTitle: {
		label: 'Source',
		required: true,
		placeholder:
			"Author's name. (YYYY). Document title (Edition nb). City : Publisher",
		config: FieldConfig.Text({}),
	},
	source: {
		label: 'PDF',
		required: true,
		config: FieldConfig.File({ accept: ['pdf'] }),
	},
}
