import { Field, FieldProps, IField } from './field';

export type FormData = {
	[key: string]: number | string,
}

export type FieldRegistrationData = Pick<IField, 'id' | 'name' | 'rules' | 'ref' | 'type' | 'defaultValue' >;

export interface UseFormReturnType {
	formContext: {
		fields: { [key: string]: Field },
		getFormValues: () => FormData,
		isFormValid: () => boolean,
		register: (field: FieldRegistrationData) => void,
		refreshFormState: () => void,
	},
	formState: { errors: FormData },
	register: (field: FieldRegistrationData) => FieldProps,
	handleSubmit: (callback: (formData: FormData) => void) => (event: React.FormEvent) => void,
}
