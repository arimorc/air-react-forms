import { CheckboxGroupValidationRules, FieldErrors, ValidationRules } from './validation';

export type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
export type InputValue = string | boolean | null;
export type FieldValue = InputValue | InputValue[] | { [key: string]: InputValue };

export interface IFormElement {
	id: string;
	name: string;
	rules?: ValidationRules | CheckboxGroupValidationRules;

	get value(): FieldValue | undefined;
	get errors(): FieldErrors;
	validate(): void;
	isValid(): boolean;
}

export interface IFormElementProps extends Omit<IFormElement, 'value' | 'errors' | 'validate' | 'isValid'> {
	defaultValue?: string,
	errors?: FieldErrors,
	type?: string,
}

/**
 * @abstract
 * @class
 * @name FormElement
 * @description Abstract class used to represent a controlled form's element.
 */
export abstract class FormElement implements IFormElement {
	id: string;
	name: string;
	rules: ValidationRules | CheckboxGroupValidationRules;
	private _errors?: FieldErrors;

	/**
	 * @constructor
	 * @author Timothée Simon-Franza
	 * @param {IFormElementProps} formElement
	 */
	constructor(formElement: IFormElementProps) {
		this.name = formElement.name;
		this.id = formElement.id;
		this.rules = formElement.rules ?? {};
		this._errors = formElement.errors ?? Object.keys(this.rules).reduce((obj, key) => ({ ...obj, [key]: undefined }), {});
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
