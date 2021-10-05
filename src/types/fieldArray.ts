import { FieldValue, FormElement, IFormElement } from './formElement';
import { IField } from './field';
import { FieldErrors } from './validation';

export interface IFieldArray extends IFormElement {
	fields: IField[],
	type?: string;
	defaultValue?: FieldValue;
}

export class FieldArray extends FormElement implements IFieldArray {
	fields: IField[];
	type?: string;
	defaultValue?: FieldValue;

	/**
	 * @param fieldArray
	 */
	constructor(fieldArray: IFieldArray) {
		super(fieldArray);
		this.type = fieldArray.type ?? 'string';
		this.defaultValue = fieldArray.defaultValue ?? '';
	}

	/**
	 * @function
	 * @name validate
	 * @description Performs a validation check on the current fieldarray's children, using its rules field's validators.
	 */
	validate = (): void => {
		this.fields.forEach((field: IField) => field.validate());
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
		return this.fields?.reduce((values, field: IField) => ({ ...values, [field.name]: field.value }), {}) ?? undefined;
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
		return this.fields.reduce((values, field: IField) => ({ ...values, [field.name]: field.errors }), {});
	}
}
