/**
 * @function
 * @name hasMinLength
 * @description A validation method used to check if the field has a minimal length of n.
 *
 * @author Timothée Simon-Franza
 *
 * @param {string|number}	value			The input's current value.
 * @param {number}			minLength		The minimal required length.
 * @param {string}			errorMessage	The message to return if the validation fails.
 *
 * @returns {string | undefined}
 */
const hasMinLength = (minLength: number, errorMessage: string) => (value: number | string): string | undefined => {
	if (!value || value.toString().trim().length < minLength) {
		return errorMessage;
	}

	return undefined;
};

export default hasMinLength;
