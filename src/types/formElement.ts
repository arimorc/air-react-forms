import { FieldErrors, ValidationRules } from './validation';

export type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
export type InputValue = number | string | null;
export type FieldValue = InputValue | InputValue[] | { [key: string]: InputValue };

export interface IFormElement {
	id: string;
	name: string;
	rules: ValidationRules;

	get value(): FieldValue | undefined;
	get errors(): FieldErrors;
	validate(): void;
	isValid(): boolean;
}

export interface FormElementRegistration extends Omit<IFormElement, 'value' | 'errors' | 'validate' | 'isValid'> {
	defaultValue?: string,
	errors?: FieldErrors,
	type?: string,
}

export abstract class FormElement implements IFormElement {
	id: string;
	name: string;
	rules: ValidationRules;
	private _errors?: FieldErrors;

	/**
	 *
	 * @param formElement
	 */
	constructor(formElement: FormElementRegistration) {
		this.name = formElement.name;
		this.id = formElement.id;
		this.rules = formElement.rules ?? {};
		this._errors = formElement.errors ?? Object.keys(formElement.rules).reduce((obj, key) => ({ ...obj, [key]: undefined }), {});
	}

	/**
	 * @function
	 * @name validate
	 * @description Performs a validation check on the field, using its rules field's validators.
	 *
	 * @author Timothée Simon-Franza
	 */
	abstract validate (): void;

	/**
	 * @property
	 * @name value
	 * @description The value of the field's linked reference.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @returns {FieldValue | undefined}
	 */
	abstract get value(): FieldValue | undefined;

	/**
	 * @property
	 * @name errors
	 * @description The errors of the form element.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @returns {FieldErrors}
	 */
	get errors(): FieldErrors {
		return this._errors;
	}

	/**
	 * @function
	 * @name isValid
	 * @description Indicates if the field is valid based on its last validation check.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @returns {boolean} True if no validation error is present, false otherwise.
	 */
	isValid(): boolean {
		if (Object.keys(this.rules).length === 0) {
			return true;
		}

		const foundErrors = Object.values(this.errors).reduce((acc, value) => (
			value !== undefined ? acc + 1 : acc
		), 0);

		return foundErrors === 0;
	}
}
