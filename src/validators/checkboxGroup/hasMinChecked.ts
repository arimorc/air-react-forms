import { Checkbox } from 'types/checkbox';
import { CheckboxGroup } from 'types/checkboxGroup';
import { ValidationValue } from 'types/validation';

/**
 * @function
 * @name hasMinChecked
 * @description A validation method used to check at least n checkboxes of the group are checked.
 *
 * @author Timothée Simon-Franza
 *
 * @param {CheckboxGroup}	checkboxGroup		The checkbox group to perform the validation on.
 * @param {number}			minCheckedAmount	The minimum amount of checkboxes that must be checked.
 * @param {string}			message				The message to return if the validation fails.
 *
 * @returns {ValidationValue}
 */
const hasMinChecked = (minCheckedAmount: number, message: string) => (checkboxGroup: CheckboxGroup): ValidationValue => {
	if (Object.values(checkboxGroup.fields).length === 0) {
		return message;
	}

	const checkedAmount = Object.values(checkboxGroup.fields)
		.reduce((acc, checkbox: Checkbox) => acc + (checkbox.checked ? 1 : 0), 0);

	return checkedAmount >= minCheckedAmount ? undefined : message;
};

export default hasMinChecked;
