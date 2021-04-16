/**
 * @function
 * @name isRequired
 * @description A validation method used to check if the field is set.
 *
 * @author Timothée Simon-Franza
 *
 * @param {string|number}	value	The input's current value.
 * @param {string}			message	The message to return if the validation fails.
 *
 * @returns {string}
 */
const isRequired = (message = 'required') => (value) => (value.trim().length === 0 ? message : '');

export default isRequired;
