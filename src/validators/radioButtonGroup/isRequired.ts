import { RadioButton } from 'types/radioButton';
import { RadioButtonGroup } from 'types/radioButtonGroup';

/**
 * @function
 * @name isRequired
 * @description A validation method used to check at least 1 radio button of the group is checked.
 *
 * @author Timothée Simon-Franza
 *
 * @param {RadioButtonGroup}	radioButtonGroup	The radio button group to perform the validation on.
 * @param {string}				errorMessage		The message to return if the validation fails.
 *
 * @returns {string | undefined}
 */
const isRequired = (errorMessage: string) => (radioButtonGroup: RadioButtonGroup): string | undefined => {
	if (Object.values(radioButtonGroup.fields).length === 0) {
		return undefined;
	}

	const checkedAmount = Object.values(radioButtonGroup.fields)
		.reduce((acc, radioButton: RadioButton) => acc + (radioButton.checked ? 1 : 0), 0);

	return checkedAmount > 0 ? undefined : errorMessage;
};

export default isRequired;
