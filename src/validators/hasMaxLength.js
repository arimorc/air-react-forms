/**
 * @function
 * @name hasMinLength
 * @description A validation method used to check if the field has a maximal length of n.
 *
 * @author Timothée Simon-Franza
 *
 * @param {string|number}	value		: The input's current value.
 * @param {number}			maxLength	: The maximal required length.
 * @param {string}			message		: The message to return if the validation fails.
 *
 * @returns {string}
 */
const hasMaxLength = (maxLength, message) => (value) => (value.trim().length <= maxLength ? '' : message);

export default hasMaxLength;
