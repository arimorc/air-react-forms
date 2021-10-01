import { Field, FieldElement, IField } from './field';

export type FormData = {
	[key: string]: number | string,
}

export interface useFormReturnType {
	formContext: {
		fields: { [key: string]: Field },
		formState: { errors: FormData },
		getFormValues: () => FormData,
		isFormValid: () => boolean,
		register: (field: IField) => void,
	},
	register: (field: IField) => void,
	handleSubmit: (callback: (formData: FormData) => void) => void,
}

export interface FieldProps extends Omit<Field, 'ref' | 'value'> {
	ref: (ref: FieldElement) => void,
	onChange?: (params?: unknown) => void,
}
