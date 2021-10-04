import { Field, FieldElement, IField } from './field';

export type FormData = {
	[key: string]: number | string,
}

export interface UseFormReturnType {
	formContext: {
		fields: { [key: string]: Field },
		getFormValues: () => FormData,
		isFormValid: () => boolean,
		register: (field: IField) => void,
		refreshFormState: () => void,
	},
	formState: { errors: FormData },
	register: (field: IField) => void,
	handleSubmit: (callback: (formData: FormData) => void) => void,
}

export interface FieldProps extends Omit<Field, 'ref' | 'value'> {
	ref: (ref: FieldElement) => void,
	onChange?: (params?: unknown) => void,
}
