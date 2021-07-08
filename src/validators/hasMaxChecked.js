/**
 * @function
 * @name hasMaxChecked
 * @description A validation method used to check if the amount of checked checkboxes is less or equal than desired.
 *
 * @author Timothée Simon-Franza
 *
 * @param {array}			checkboxGroupRef	The reference to the checkbox group.
 * @param {number}			maxCheckedAmount	The maximum allowed amount of checked checkboxes.
 * @param {string}			message				The message to return if the validation fails.
 *
 * @returns {string}
 */
const hasMaxChecked = (maxCheckedAmount, message) => (checkboxGroupRef) => {
	const { isCheckboxGroup, name, rules, ...fields } = checkboxGroupRef;

	const checkedAmount = Object.values(fields)
		.filter(({ ref }) => ref)
		.reduce((acc, { ref: { checked } }) => acc + (checked ? 1 : 0), 0);

	return checkedAmount <= maxCheckedAmount ? '' : message;
};

export default hasMaxChecked;
