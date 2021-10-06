import { createRef, MutableRefObject } from 'react';
import { isEmpty } from 'lodash';

import { FieldElement, FieldValue, FormElement, IFormElement, InputValue } from './formElement';
import { FieldRegistrationData } from './useForm';

export interface IField extends IFormElement {
	ref?: MutableRefObject<FieldElement | undefined>;
	type?: string;
	defaultValue?: InputValue;
}

export interface FieldProps extends Omit<Field, 'errors' | 'isValid' | 'ref' | 'value' | 'validate' | 'focus'> {
	ref: (ref: FieldElement) => void,
	onChange?: (params?: unknown) => void,
}

export class Field extends FormElement implements IField {
	ref?: MutableRefObject<FieldElement | undefined>;
	type?: string;
	defaultValue?: InputValue;

	/**
	 *
	 * @param field
	 */
	constructor(field: FieldRegistrationData) {
		super(field as Field);
		this.ref = field.ref ?? createRef<FieldElement>();
		this.type = field.type ?? 'text';
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
	 * @function
	 * @name focus
	 * @description Focuses the field's HTMLElement.
	 *
	 * @author Timothée Simon-Franza
	 */
	focus = (): void => {
		this.ref?.current?.focus();
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
