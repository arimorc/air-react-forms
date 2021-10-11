import { MutableRefObject } from 'react';
import { Field, IFieldReturnProps } from './field';
import { FormElement, IFormElementProps } from './formElement';
import { FieldErrors } from './validation';

export type FormData = {
	[key: string]: number | string,
}

export interface IUseFormProps {
	validateOnChange?: boolean,
}

export interface IFormContext {
	fields: { [key: string]: FormElement },
	formErrorsRef: MutableRefObject<{ [key: string]: FieldErrors }>,
	getFormValues: () => FormData,
	isFormValid: () => boolean,
	register: (field: IFormElementProps) => void,
	refreshFormState: () => void,
	validateField: (shouldRefreshFormState: boolean) => (field: Field) => void,
	validateOnChange: boolean,
}

export interface IUseFormReturn {
	formContext: IFormContext,
	formState: { errors: FormData },
	register: (field: IFormElementProps) => IFieldReturnProps,
	handleSubmit: (callback: (formData: FormData) => void) => (event: React.FormEvent) => void,
}
