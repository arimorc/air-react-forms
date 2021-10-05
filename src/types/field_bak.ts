import { createRef, MutableRefObject } from 'react';
import { isEmpty } from 'lodash';
import { FieldProps } from './useForm';
import { ValidationRules, ValidationValue } from './validation';

export type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

type FieldValue = number | string | null;

export type FieldErrors = { [key: string]: ValidationValue }

export interface IField {
	id: string;
	name: string;
	ref?: MutableRefObject<FieldElement | undefined>;
	rules: ValidationRules;
	errors?: FieldErrors;
	type?: string;
	defaultValue?: string | number;
}

export class Field implements IField {
	id: string;
	name: string;
	ref: MutableRefObject<FieldElement | undefined>;
	rules: ValidationRules;
	errors: FieldErrors;
	type?: string;
	defaultValue?: string | number;

	/**
	 *
	 */
	constructor(field: IField) {
		this.name = field.name;
		this.id = field.id;
		this.ref = field.ref ?? createRef<FieldElement>();
		this.type = field.type ?? 'string';
		this.rules = field.rules ?? {};
		this.errors = field.errors ?? Object.keys(field.rules).reduce((obj, key) => ({ ...obj, [key]: undefined }), {});
		this.defaultValue = field.defaultValue ?? '';
	}

	/**
	 * @function
	 * @name validate
	 * @description Performs a validation check on the field, using its rules field's validators.
	 *
	 * @author Timothée Simon-Franza
	 */
	validate = (): void => {
		if (isEmpty(this.rules) || this.ref?.current?.value === undefined) {
			return;
		}

		Object.entries(this.rules).forEach(([rule, validator]) => {
			this.errors[rule] = validator(this.ref?.current?.value) || undefined;
		});
	}

	/**
	 * @property
	 * @name value
	 * @description The value of the field's linked reference.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @returns {FieldValue | undefined}
	 */
	get value(): FieldValue | undefined {
		return this.ref?.current?.value ?? undefined;
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
	isValid = (): boolean => {
		const foundErrors = Object.values(this.errors).reduce((acc, value) => (
			value !== undefined ? acc + 1 : acc
		), 0);

		return foundErrors === 0;
	}

	/**
	 * @static
	 * @function
	 * @name extractFieldProps
	 * @description Extracts data from a Field object to create a FieldProps object.
	 *
	 * @author Timothée Simon-Franza
	 * @param {Field} field	The field instance to extract data from.
	 *
	 * @returns {FieldProps}
	 */
	static extractFieldProps = (field: Field): FieldProps => ({
		id: field.id,
		name: field.name,
		rules: field.rules,
		type: field.type,
		defaultValue: field.defaultValue,
		ref: undefined,
	})
}
