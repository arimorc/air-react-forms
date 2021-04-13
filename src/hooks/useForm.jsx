import { useCallback, useRef } from 'react';
import logger from '../utils/logger';

/**
 * @name useForm
 * @description A hook providing several method to control forms.
 *
 * @author Timothée Simon-Franza
 */
const useForm = () => {
	const inputsRefs = useRef({});
	const formState = useRef({
		errors: {},
		isDirty: false,
	});

	/**
	 * @function
	 * @name getFormValues
	 * @description Returns the value of all controlled fields as an object.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @returns {object}
	 */
	const getFormValues = () => {
		const formValues = Object.values(inputsRefs.current)
			.map(({ element: { value }, name }) => ([name, value]));

		return Object.fromEntries(formValues);
	};

	/**
	 * @function
	 * @name validateForm
	 * @description Performs a validation check on each registered input.
	 *
	 * @author Timothée Simon-Franza
	 */
	const validateForm = () => {
		Object.values(inputsRefs.current).forEach(({ element: { value }, name, rules }) => {
			if (rules) {
				Object.entries(rules).forEach(([rule, validator]) => {
					formState.current.errors[name] = { ...formState.current.errors[name], [rule]: validator(value) };
				});
			}
		});
	};

	/**
	 * @function
	 * @name registerFormField
	 * @description A callback method used by controlled form fields to register themselves to the form.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {object} formFieldRef The ref to register.
	 */
	const registerFormField = useCallback((formFieldRef) => {
		if (formFieldRef.name) {
			inputsRefs.current[formFieldRef.name] = formFieldRef;
			formState.current.errors[formFieldRef.name] = {};
		} else {
			logger.warn('attempting to register a form without a name property.');
		}
	}, [inputsRefs]);

	/**
	 * @function
	 * @name unRegisterFormField
	 * @description A callback method used by controlled form fields to unregister themselves from the form.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {object} formFieldRefName The name under which the ref has been registered.
	 */
	const unregisterFormField = useCallback((formFieldRefName) => {
		if (inputsRefs.current[formFieldRefName]) {
			delete inputsRefs.current[formFieldRefName];
			delete formState.current.errors[formFieldRefName];
		}
	}, [inputsRefs]);

	/**
	 * @function
	 * @name registerWrapper
	 * @description Convenience method to be passed to any form field wrapper, providing them with necessary methods and information as components props.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @example <FormFieldWrapper {...registerWrapper('name')}> ... </FormFieldWrapper>
	 *
	 * @param {string} wrapperName The name under which the wrapped input will be named.
	 *
	 * @returns {object}
	 */
	const registerWrapper = (wrapperName) => {
		if (!wrapperName || wrapperName.trim().length === 0) {
			throw new Error(`${logger.PREFIX} : Attempting to register a form field without a name property.`);
		}

		return {
			name: wrapperName,
			registerFormField,
			unregisterFormField,
		};
	};

	/**
	 * @function
	 * @name handleSubmit
	 * @description A handler used to apply validation to each controlled input of the form and return their value if all are valid.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {object} event The "form submit" event to handle.
	 *
	 * @returns {object}
	 */
	const handleSubmit = (event) => {
		event.preventDefault();
		validateForm();

		return getFormValues();
	};

	/**
	 * @function
	 * @name getFieldsRefs
	 * @description Returns a list of all controlled fields.
	 *
	 * @returns {object}
	 */
	const getFieldsRefs = () => (inputsRefs.current);

	return {
		formState: formState.current,
		getFieldsRefs,
		getFormValues,
		handleSubmit,
		registerWrapper,
	};
};

export default useForm;
