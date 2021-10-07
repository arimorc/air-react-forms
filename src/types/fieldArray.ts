import { FieldValue, FormElement, FormElementRegistration, IFormElement } from './formElement';
import { Field, IField } from './field';
import { FieldErrors } from './validation';

export interface IFieldArray extends IFormElement {
	fields: { [key: string]: Field },
	type?: string;
	defaultValue?: FieldValue;
}

export class FieldArray extends FormElement implements IFieldArray {
	fields: { [key: string]: Field };
	type?: string;
	defaultValue?: FieldValue;

	/**
	 * @param fieldArray
	 */
	constructor(fieldArray: FormElementRegistration) {
		super(fieldArray);
		this.fields = {};
		this.type = fieldArray.type ?? 'string';
		this.defaultValue = fieldArray.defaultValue ?? '';
	}

	/**
	 * @function
	 * @name validate
	 * @description Performs a validation check on the current fieldarray's children, using its rules field's validators.
	 */
	validate = (): void => {
		Object.values(this.fields).forEach((field: IField) => field.validate());
	}

	/**
	 * @property
	 * @name value
	 * @description The values of the arrayfield's children, bundled into an object.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @returns {FieldValue | undefined}
	 */
	get value(): FieldValue | undefined {
		return Object.values(this.fields)?.reduce((values, field: IField) => ({ ...values, [field.name]: field.value }), {}) ?? undefined;
	}

	/**
	 * @property
	 * @name errors
	 * @description The errors of the arrayfield's children, bundled into an object.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @returns {FieldErrors}
	 */
	get errors(): FieldErrors {
		return Object.values(this.fields).reduce((values, field: IField) => ({ ...values, [field.name]: field.errors }), {});
	}

	/**
	 * @function
	 * @name addField
	 * @description Registers a new field as a children of the current fieldArray.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {Field} field The field to register.
	 */
	addField(field: Field): void {
		this.fields[field.name] = field;
	}
}
