/**
 * @function
 * @name hasMinLength
 * @description A validation method used to check if the field has a minimal length of n.
 *
 * @author Timothée Simon-Franza
 *
 * @param {string|number}	value		: The input's current value.
 * @param {number}			minLength	: The minimal required length.
 * @param {string}			message		: The message to return if the validation fails.
 *
 * @returns {string}
 */
const hasMinLength = (minLength, message) => (value) => (value.trim().length >= minLength ? message : '');

export default hasMinLength;
