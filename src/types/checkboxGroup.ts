import { isEmpty } from 'lodash';
import { FieldValue, FormElement, IFormElement, IFormElementProps } from './formElement';
import { Checkbox } from './checkbox';
import { IFieldProps, IFieldReturnProps } from './field';
import { CheckboxGroupValidationRules } from './validation';

export interface IUseCheckboxGroupProps extends IFormElementProps {
	type: 'checkbox';
}

export interface IUseCheckboxGroupReturn {
	register: (field: IFieldProps) => IFieldReturnProps,
	validateCheckboxGroup: (shouldRefreshFormState: boolean) => void,
}

export interface ICheckboxGroup extends IFormElement {
	fields: { [key: string]: Checkbox },
	rules?: CheckboxGroupValidationRules;
	type: 'checkbox';
	defaultValue?: FieldValue;
}

/**
 * @class
 * @name CheckboxGroup
 * @description The class representing a checkbox group.
 * @extends FormElement
 */
export class CheckboxGroup extends FormElement implements ICheckboxGroup {
	fields: { [key: string]: Checkbox };
	rules: CheckboxGroupValidationRules;
	type: 'checkbox';
	defaultValue?: FieldValue;

	/**
	 * @constructor
	 * @author Timothée Simon-Franza
	 * @param {IFormElementProps} checkboxGroupProps
	 */
	constructor(checkboxGroupProps: IFormElementProps) {
		super(checkboxGroupProps);
		this.fields = {};
		this.defaultValue = checkboxGroupProps.defaultValue ?? false;
	}

	/**
	 * @property
	 * @name value
	 * @description The values of the checkboxGroup's children, bundled into an object.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @returns {FieldValue}
	 */
	get value(): FieldValue | undefined {
		return Object.values(this.fields)?.reduce((values, field: Checkbox) => ({ ...values, [field.value]: field.checked }), {});
	}

	/**
	 * @function
	 * @name validate
	 * @description Performs a validation check on the checkbox group's fields as a whole, using its rules field's validators.
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
	 * @description Registers a new checkbox as a children of the current checkbox group.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {Checkbox} field The checkbox to register.
	 */
	addField(field: Checkbox): void {
		this.fields[field.value] = field;
	}
}
