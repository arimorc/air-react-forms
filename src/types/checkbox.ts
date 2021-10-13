import { createRef, MutableRefObject } from 'react';

export interface ICheckbox {
	id: string;
	name: string;
	value: string;
	ref?: MutableRefObject<HTMLInputElement | undefined>;
	type: string;
	defaultChecked?: boolean;

	get checked(): boolean;
	set checked(checked: boolean);
}

export interface ICheckboxProps extends Omit<ICheckbox, 'checked'> {
	checked: boolean,
}

export interface ICheckboxReturnProps extends Omit<ICheckboxProps, 'checked' | 'ref'> {
	ref: (ref: HTMLInputElement) => void,
	onChange?: (params?: unknown) => void,
}

export class Checkbox implements ICheckbox {
	id: string;
	name: string;
	value: string;
	ref?: MutableRefObject<HTMLInputElement | undefined>;
	type: string;
	defaultChecked?: boolean;

	/**
	 * @constructor
	 * @author Timothée Simon-Franza
	 * @param {IFormElementProps} formElement
	 */
	constructor(checkbox: ICheckboxProps) {
		this.id = checkbox.id;
		this.name = checkbox.name;
		this.value = checkbox.value;
		this.type = 'checkbox';
		this.ref = checkbox.ref ?? createRef<HTMLInputElement>();
		this.defaultChecked = checkbox.defaultChecked ?? false;
	}

	/**
	 * @property
	 * @name checked
	 * @description Returns the checkbox's linked reference's checked state. Defaults to false.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @returns {boolean}
	 */
	get checked(): boolean {
		return this.ref?.current?.checked ?? false;
	}

	/**
	 * @property
	 * @name checked
	 * @description Sets the checkbox's linked reference's checked state with the one provided in parameter.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {boolean} checked The state to set.
	 */
	set checked(checked: boolean) {
		if (this.ref?.current) {
			this.ref.current.checked = checked;
		}
	}

	/**
	 * @static
	 * @function
	 * @name extractCheckboxProps
	 * @description Extracts data from a Checkbox object to create an ICheckboxReturnProps object.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {ICheckbox} checkbox	The checkbox instance to extract data from.
	 *
	 * @returns {ICheckboxReturnProps}
	 */
	static extractCheckboxProps = (checkbox: ICheckbox): ICheckboxReturnProps => ({
		id: checkbox.id,
		name: checkbox.name,
		type: checkbox.type,
		defaultChecked: checkbox.defaultChecked,
		value: checkbox.value,
		ref: undefined,
	})
}
