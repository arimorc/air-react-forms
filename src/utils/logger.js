/* eslint-disable no-console */
/**
 * @constant
 * @name PREFIX
 * @description A string used to prefix any log or error message, inducing it comes from the library.
 *
 * @author Timothée Simon-Franza
 */
const PREFIX = '[react-air-forms]';

/**
 * @function
 * @name warn
 * @description Displays a formatted warning message in the console.
 *
 * @author Timothée Simon-Franza
 *
 * @param {string} message : The message to display.
 */
const warn = (message) => {
	if (process.env.NODE_ENV !== 'production') {
		console.warn('%s : %s', PREFIX, message);
	}
};

/**
 * @function
 * @name error
 * @description Displays a formatted error message in the console.
 *
 * @author Timothée Simon-Franza
 *
 * @param {string} message : The message to display
 */
const error = (message) => {
	if (process.env.NODE_ENV !== 'production') {
		console.error('%s : %s', PREFIX, message);
	}
};

const logger = {
	warn,
	error,
	PREFIX,
};

export default logger;
