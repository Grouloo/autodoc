import { create, type ArticleCreationForm } from './create'
import { generate } from './generate'
import { addSectionFromUrl, type AddSectionForm } from './addSectionFromUrl'
import { type AddSectionPDFForm, addSectionFromPDF } from './addSectionFromPDF'
import { type WriteDescriptionForm, writeDescription } from './writeDescription'

export type {
	ArticleCreationForm,
	AddSectionForm,
	AddSectionPDFForm,
	WriteDescriptionForm,
}
export {
	create,
	generate,
	addSectionFromUrl,
	addSectionFromPDF,
	writeDescription,
}
