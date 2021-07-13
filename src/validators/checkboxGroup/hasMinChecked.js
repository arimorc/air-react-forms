import logger from '../../utils/logger';

/**
 * @function
 * @name hasMinChecked
 * @description A validation method used to check at least n checkboxes of the group are checked.
 *
 * @author Timothée Simon-Franza
 *
 * @param {array}			checkboxGroupRef	The reference to the checkbox group.
 * @param {number}			minCheckedAmount	The minimum amount of checkboxes that must be checked.
 * @param {string}			message				The message to return if the validation fails.
 *
 * @returns {string}
 */
const hasMinChecked = (minCheckedAmount, message) => (checkboxGroupRef) => {
	const { isCheckboxGroup, name, rules, ...fields } = checkboxGroupRef;
	const fieldsAmount = Object.values(fields ?? {}).length;

	if (fieldsAmount === 0) {
		logger.warn(`tried to check if the ${name} checkbox group has at least ${minCheckedAmount} inputs checked even though it has no checkbox.`);

		return '';
	}

	if (minCheckedAmount > fieldsAmount) {
		logger.warn(`tried to check if the ${name} checkbox group has at least ${minCheckedAmount} inputs checked even though it only has ${fieldsAmount} checkboxes.`);

		return '';
	}

	const checkedAmount = Object.values(fields)
		.filter(({ ref }) => ref)
		.reduce((acc, { ref: { checked } }) => acc + (checked ? 1 : 0), 0);

	return checkedAmount >= minCheckedAmount ? '' : message;
};

export default hasMinChecked;
