import { Checkbox } from 'types/checkbox';
import { CheckboxGroup } from 'types/checkboxGroup';
import { ValidationValue } from 'types/validation';

/**
 * @function
 * @name hasMaxChecked
 * @description A validation method used to check if the amount of checked checkboxes is less or equal than desired.
 *
 * @author Timothée Simon-Franza
 *
 * @param {array}			checkboxGroup		The checkbox group to perform the validation on.
 * @param {number}			maxCheckedAmount	The maximum allowed amount of checked checkboxes.
 * @param {string}			message				The message to return if the validation fails.
 *
 * @returns {string | undefined}
 */
const hasMaxChecked = (maxCheckedAmount: number, message: string) => (checkboxGroup: CheckboxGroup): ValidationValue => {
	if (Object.values(checkboxGroup.fields).length === 0) {
		return undefined;
	}

	if (maxCheckedAmount > Object.values(checkboxGroup.fields).length) {
		// logger.warn(`tried to check if the ${name} checkbox group has at most ${maxCheckedAmount} inputs checked even though it only has ${fieldsAmount} checkboxes.`);

		return undefined;
	}

	const checkedAmount = Object.values(checkboxGroup.fields)
		.reduce((acc, checkbox: Checkbox) => acc + (checkbox.checked ? 1 : 0), 0);

	return checkedAmount <= maxCheckedAmount ? undefined : message;
};

export default hasMaxChecked;
