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
 * @param {array}			checkboxGroup		The checkbox group to perform the validation on.
 * @param {number}			minCheckedAmount	The minimum amount of checkboxes that must be checked.
 * @param {string}			message				The message to return if the validation fails.
 *
 * @returns {string | undefined}
 */
const hasMinChecked = (minCheckedAmount: number, message: string) => (checkboxGroup: CheckboxGroup): ValidationValue => {
	if (Object.values(checkboxGroup.fields).length === 0) {
		return undefined;
	}

	if (minCheckedAmount > Object.values(checkboxGroup.fields).length) {
		// logger.warn(`tried to check if the ${name} checkbox group has at least ${minCheckedAmount} inputs checked even though it only has ${fieldsAmount} checkboxes.`);

		return undefined;
	}

	const checkedAmount = Object.values(checkboxGroup.fields)
		.reduce((acc, checkbox: Checkbox) => acc + (checkbox.checked ? 1 : 0), 0);

	return checkedAmount >= minCheckedAmount ? undefined : message;
};

export default hasMinChecked;
