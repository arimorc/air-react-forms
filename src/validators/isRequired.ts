/**
 * @function
 * @name isRequired
 * @description A validation method used to check if the field is set.
 *
 * @author Timothée Simon-Franza
 *
 * @param {string|number}	value			The input's current value.
 * @param {string}			errorMessage	The message to return if the validation fails.
 *
 * @returns {string | undefined}
 */
const isRequired = (errorMessage = 'required') => (value: number | string): string | undefined => {
	if (!value || value.toString().trim().length < 1) {
		return errorMessage;
	}

	return undefined;
};

export default isRequired;
