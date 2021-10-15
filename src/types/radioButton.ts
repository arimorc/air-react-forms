import { createRef, MutableRefObject } from 'react';

export interface IRadioButton {
	id: string;
	name: string;
	value: string;
	ref?: MutableRefObject<HTMLInputElement | undefined>;
	type: string;
	defaultChecked?: boolean;

	get checked(): boolean;
	set checked(checked: boolean);
}

export interface IRadioButtonProps extends Omit<IRadioButton, 'checked'> {
	checked: boolean,
}

export interface IRadioButtonReturnProps extends Omit<IRadioButtonProps, 'checked' | 'ref'> {
	ref: (ref: HTMLInputElement) => void,
	onChange?: (params?: unknown) => void,
}

/**
 * @class
 * @name RadioButton
 * @description Class used to represent a controlled form's radio button field.
 */
export class RadioButton implements IRadioButton {
	id: string;
	name: string;
	value: string;
	ref?: MutableRefObject<HTMLInputElement | undefined>;
	type: string;
	defaultChecked?: boolean;

	/**
	 * @constructor
	 * @author Timothée Simon-Franza
	 * @param {IRadioButtonProps} radioButton
	 */
	constructor(radioButton: IRadioButtonProps) {
		this.id = radioButton.id;
		this.name = radioButton.name;
		this.value = radioButton.value;
		this.type = 'radio';
		this.ref = radioButton.ref ?? createRef<HTMLInputElement>();
		this.defaultChecked = radioButton.defaultChecked ?? false;
	}

	/**
	 * @property
	 * @name checked
	 * @description Returns the radio button's linked reference's checked state. Defaults to false.
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
	 * @description Sets the radio button's linked reference's checked state with the one provided in parameter.
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
	 * @name extractRadioButtonProps
	 * @description Extracts data from a RadioButton object to create an IRadioButtonReturnProps object.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {IRadioButton} radioButton The radio button instance to extract data from.
	 *
	 * @returns {IRadioButtonReturnProps}
	 */
	static extractCheckboxProps = (radioButton: IRadioButton): IRadioButtonReturnProps => ({
		id: radioButton.id,
		name: radioButton.name,
		type: radioButton.type,
		defaultChecked: radioButton.defaultChecked,
		value: radioButton.value,
		ref: undefined,
	})
}
