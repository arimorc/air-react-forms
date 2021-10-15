import { isEmpty, partition } from 'lodash';
import { IFieldProps, IFieldReturnProps } from './field';
import { FieldValue, FormElement, IFormElement, IFormElementProps, InputValue } from './formElement';
import { RadioButton } from './radioButton';

export interface IUseRadioButtonGroupProps extends IFormElementProps {
	type: 'radio'
}

export interface IUseRadioButtonGroupReturn {
	register: (field: IFieldProps) => IFieldReturnProps,
	validateRadioButtonGroup: (shouldRefreshFormState: boolean) => void,
}

export interface IRadioButtonGroup extends IFormElement {
	fields: { [key: string]: RadioButton },
	type: 'radio';
	defaultValue?: FieldValue;
}

/**
 * @class
 * @name RadioButtonGroup
 * @description The class representing a radio button group.
 * @extends FormElement
 */
export class RadioButtonGroup extends FormElement implements IRadioButtonGroup {
	fields: { [key: string]: RadioButton };
	type: 'radio';
	defaultValue?: FieldValue;

	/**
	 * @constructor
	 * @author Timothée Simon-Franza
	 * @param {IFormElementProps} radioButtonGroupProps
	 */
	constructor(radioButtonGroupProps: IFormElementProps) {
		super(radioButtonGroupProps);
		this.fields = {};
		this.defaultValue = radioButtonGroupProps.defaultValue ?? undefined;
	}

	/**
	 * @property
	 * @name value
	 * @description Returns the radiobutton group's selected value.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @returns {InputValue | undefined}
	 */
	get value(): InputValue | undefined {
		return Object.values(this.fields)?.filter((field: RadioButton) => field.checked)?.[0]?.value ?? undefined;
	}

	/**
	 * @property
	 * @name value
	 * @description Sets the checked property of the field whose value matches the provided one to true, and the others' to false.
	 *
	 * @author Timothée Simon-Franza
	 */
	set value(value: InputValue) {
		const [linkedValues, unlinkedValues] = partition(Object.values(this.fields), (field: RadioButton) => field.value === value);
		if (linkedValues.length !== 1) {
			return;
		}

		linkedValues[0].checked = true;

		// eslint-disable-next-line no-param-reassign
		unlinkedValues.forEach((field: RadioButton) => { field.checked = false; });
	}

	/**
	 * @function
	 * @name validate
	 * @description Performs a validation check on the radio button group's fields as a whole, using its rules field's validators.
	 *
	 * @author Timothée Simon-Franza
	 */
	validate(): void {
		if (isEmpty(this.rules) || isEmpty(this.fields)) {
			return;
		}

		Object.entries(this.rules).forEach(([rule, validator]) => {
			this.errors[rule] = validator(this) || undefined;
		});
	}

	/**
	 * @function
	 * @name addField
	 * @description Registers a new radio button as a children of the current radio button group.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {RadioButton} field The radio button to register.
	 */
	addField(field: RadioButton): void {
		this.fields[field.value] = field;
	}
}
