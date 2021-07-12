import logger from '../../utils/logger';

/**
 * @function
 * @name isRequired
 * @description A validation method used to check at least 1 radio button of the group is checked.
 *
 * @author Timothée Simon-Franza
 *
 * @param {array}	radioButtonGroupRef	The reference to the radio button group.
 * @param {string}	message				The message to return if the validation fails.
 *
 * @returns {string}
 */
const isRequired = (message) => (radioButtonGroupRef) => {
	const { isRadioButtonGroup, name, rules, ...fields } = radioButtonGroupRef;

	if (Object.values(fields ?? {}).length === 0) {
		logger.warn(`tried to check if the ${name} radio button group has at least 1 input checked even though it has no input.`);

		return '';
	}

	const checkedAmount = Object.values(fields)
		.filter(({ ref }) => ref)
		.reduce((acc, { ref: { checked } }) => acc + (checked ? 1 : 0), 0);

	return checkedAmount >= 1 ? '' : message;
};

export default isRequired;
