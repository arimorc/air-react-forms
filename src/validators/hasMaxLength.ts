import { FieldValue } from 'types/formElement';

/**
 * @function
 * @name hasMaxLength
 * @description A validation method used to check if the field has a maximal length of n.
 *
 * @author Timothée Simon-Franza
 *
 * @param {FieldValue}	value			The input's current value.
 * @param {number}		maxLength		The maximal required length.
 * @param {string}		errormessage	The message to return if the validation fails.
 *
 * @returns {string | undefined}
 */
const hasMaxLength = (maxLength: number, errorMessage: string) => (value: FieldValue): string | undefined => {
	if (value && value.toString().trim().length > maxLength) {
		return errorMessage;
	}

	return undefined;
};

export default hasMaxLength;
