import React, { createRef, MutableRefObject } from 'react';
import { isEmpty } from 'lodash';

import { FieldElement, FormElement, IFormElement, IFormElementProps, InputValue } from './formElement';
import { ValidationRules } from './validation';

export interface IField extends IFormElement {
	ref?: MutableRefObject<FieldElement | undefined>;
	rules?: ValidationRules;
	type?: string;
	defaultValue?: InputValue;
}

export interface IFieldProps extends Omit<IFormElementProps, 'isValid' | 'ref' | 'value' | 'validate' > {
	ref?: MutableRefObject<FieldElement | undefined>;
}

export interface IFieldReturnProps extends Omit<IFieldProps, 'ref'> {
	ref: React.RefCallback<FieldElement>,
	onChange?: (params?: unknown) => void,
}

/**
 * @class
 * @name field
 * @description Class used to represent a controlled form's field, usually an input.
 * @extends FormElement
 */
export class Field extends FormElement implements IField {
	ref?: MutableRefObject<FieldElement | undefined>;
	rules: ValidationRules;
	type?: string;
	defaultValue?: InputValue;

	/**
	 * @constructor
	 * @author Timothée Simon-Franza
	 * @param {IFieldProps} field
	 */
	constructor(field: IFieldProps) {
		super(field);
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
	validate(): void {
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
	 * @description Returns the value of the field's linked reference.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @returns {InputValue | undefined}
	 */
	get value(): InputValue | undefined {
		return this.ref?.current?.value ?? undefined;
	}

	/**
	 * @property
	 * @name value
	 * @description Sets the field's linked reference's value with the one provided in parameter.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {InputValue} value The value to set.
	 */
	set value(value: InputValue) {
		if (this.ref?.current) {
			this.ref.current.value = value.toString();
		}
	}

	/**
	 * @static
	 * @function
	 * @name extractFieldProps
	 * @description Extracts data from a Field object to create an IFieldReturnProps object.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {IField} field	The field instance to extract data from.
	 *
	 * @returns {IFieldReturnProps}
	 */
	static extractFieldProps = (field: IField): IFieldReturnProps => ({
		id: field.id,
		name: field.name,
		rules: field.rules,
		type: field.type,
		defaultValue: field.defaultValue.toString(),
		ref: undefined,
	})
}
