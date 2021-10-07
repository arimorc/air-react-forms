import { MutableRefObject } from 'react';
import { Field, FieldProps } from './field';
import { FieldElement, FormElementRegistration } from './formElement';
import { FieldErrors } from './validation';

export type FormData = {
	[key: string]: number | string,
}

export interface FieldRegistrationData extends FormElementRegistration {
	ref?: MutableRefObject<FieldElement | undefined>;
}

export interface FormContext {
	fields: { [key: string]: Field },
	formErrorsRef: MutableRefObject<{ [key: string]: FieldErrors }>,
	getFormValues: () => FormData,
	isFormValid: () => boolean,
	register: (field: FormElementRegistration) => void,
	refreshFormState: () => void,
	validateField: (shouldRefreshFormState: boolean) => (field: Field) => void,
}

export interface UseFormReturnType {
	formContext: FormContext,
	formState: { errors: FormData },
	register: (field: FormElementRegistration) => FieldProps,
	handleSubmit: (callback: (formData: FormData) => void) => (event: React.FormEvent) => void,
}
