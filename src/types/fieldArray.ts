import { FieldValue, FormElement, IFormElementProps, IFormElement } from './formElement';
import { Field, IFieldReturnProps, IField, IFieldProps } from './field';
import { FieldErrors } from './validation';

export interface IUseFieldArrayProps extends IFormElementProps {
	type?: string;
}

export interface IUseFieldArrayReturn {
	append: () => IFieldReturnProps,
	fields: { [key: string]: Field };
	register: (field: IFieldProps) => IFieldReturnProps,
	remove: (field: Field) => void,
}

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
	constructor(fieldArray: IFormElementProps) {
		super(fieldArray);
		this.fields = {};
		this.type = fieldArray.type ?? 'text';
		this.defaultValue = fieldArray.defaultValue ?? '';
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
		return Object.values(this.fields)?.reduce((values, field: IField) => ({ ...values, [field.name]: field.value }), {});
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
	 * @name validate
	 * @description Performs a validation check on the current fieldarray's children, using its rules field's validators.
	 */
	validate = (): void => {
		Object.values(this.fields).forEach((field: IField) => field.validate());
	}

	/**
	 * @function
	 * @name isValid
	 * @description Checks if fields registered inside this field array are all valid.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @returns {boolean} True if all children are valid, false otherwise.
	 */
	isValid = (): boolean => {
		if (Object.keys(this.rules).length === 0) {
			return true;
		}

		return !Object.values(this.fields).some((field: FormElement) => field.isValid() === false);
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
