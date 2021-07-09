import isEqual from 'lodash.isequal';

/**
 * @function
 * @name isCheckbox
 * @description Determines if the provided element is a checkbox input.
 *
 * @author Timothée Simon-Franza
 *
 * @param {*} element The element to assert type of.
 *
 * @returns {bool} true if the element is a checkbox input, false otherwise.
 */
const isCheckbox = (element) => element?.type === 'checkbox';

/**
 * @function
 * @name isRadio
 * @description Determines if the provided element is a radio input.
 *
 * @author Timothée Simon-Franza
 *
 * @param {*} element The element to assert type of.
 *
 * @returns {bool} true if the element is a radio input, false otherwise.
 */
const isRadio = (element) => element?.type === 'radio';

/**
 * @function
 * @name isRadioOrCheckbox
 * @description Determines if the provided element is a checkbox or a radio input.
 *
 * @param {*} element The element to assert the type of.
 *
 * @returns {bool} true if the element is a checkbox or radio input, false otherwise.
 */
const isRadioOrCheckbox = (element) => isCheckbox(element) || isRadio(element);

/**
 * @function
 * @name isSelect
 * @param {*} element The element to assert the type of.
 *
 * @returns {bool} true if the element is a select, false otherwise.
 */
const isSelect = (element) => element?.type === 'select-one' || element?.type === 'select-multiple';

/**
 * @name getDefaultValueByType
 * @description Returns a valid default value depending on the input type provided in parameters.
 *
 * @author Timothée Simon-Franza
 *
 * @param {string} inputType The input type to provide a default value for.
 *
 * @returns {string|number|Date|null}
 */
const getDefaultValueByInputType = (inputType) => {
	if (['text', 'email', 'tel'].includes(inputType)) {
		return '';
	}

	if (isEqual(inputType, 'number')) {
		return 0;
	}

	if (isEqual(inputType, 'color')) {
		return '#FFFFFF';
	}

	return null;
};

export {
	getDefaultValueByInputType,
	isCheckbox,
	isRadio,
	isRadioOrCheckbox,
	isSelect,
};
