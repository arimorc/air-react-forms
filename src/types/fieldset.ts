import { Field, IField, IFieldReturnProps } from './field';
import { FieldValue, FormElement, IFormElement, IFormElementProps } from './formElement';
import { FieldErrors } from './validation';

export type IUseFieldsetProps = Omit<IFormElement, 'errors' | 'isValid' | 'rules' | 'validate' | 'value'>;

export interface IUseFieldsetReturn {
	fields: { [key: string]: Field },
	register: (fieldData: IFormElementProps) => IFieldReturnProps,
	validateFieldset: (shouldRefreshFormState: boolean) => void,
}

export interface IFieldArray extends IFormElement {
	fields: { [key: string]: Field },
}

/**
 * @class
 * @name Fieldset
 * @description The class representing a fieldset.
 * @extends FormElement
 */
export class Fieldset extends FormElement implements IFieldArray {
	fields: { [key: string]: Field };

	/**
	 * @constructor
	 * @author Timothée Simon-Franza
	 * @param {IFormElementProps} fieldsetData
	 */
	constructor(fieldsetData: IFormElementProps) {
		super(fieldsetData);
		this.fields = {};
	}

	/**
	 * @property
	 * @name value
	 * @description The values of the fieldset's children, bundled into an object.
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
	 * @description The errors of the fieldset's children, bundled into an object.
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
	 * @description Performs a validation check on the current fielset's children, using its rules field's validators.
	 */
	validate = (): void => {
		Object.values(this.fields).forEach((field: IField) => field.validate());
	}

	/**
	 * @function
	 * @name isValid
	 * @description Checks if fields registered inside this fieldset are all valid.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @returns {boolean} True if all children are valid, false otherwise.
	 */
	isValid = (): boolean => !Object.values(this.fields).some((field: FormElement) => field.isValid() === false);

	/**
	 * @function
	 * @name registerField
	 * @description Registers a field as a children of the current fieldset.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {Field} field The field to register.
	 */
	registerField(field: Field): void {
		this.fields[field.name] = field;
	}
}
