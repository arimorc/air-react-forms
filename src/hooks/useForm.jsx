import { useCallback, useRef, useState } from 'react';
import logger from '../utils/logger';

/**
 * @name useForm
 * @description A hook providing several method to control forms.
 *
 * @author Timothée Simon-Franza
 */
const useForm = () => {
	const inputsRefs = useRef({});
	const formStateRef = useRef({
		errors: {},
		isDirty: false,
	});

	const [formState, setFormState] = useState({ errors: {} });

	/**
	 * @function
	 * @name syncStateWithRef
	 * @description Syncs the exported formState object with the current formStateRef value.
	 *
	 * @author Timothée Simon-Franza
	 */
	const syncStateWithRef = () => setFormState({ ...formStateRef.current });

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
	 * @name validateField
	 * @description Performs a validation check on the requested input.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {string} fieldName The name of the field to perform validation on.
	 */
	const validateField = (shouldUpdateState = false) => (fieldName) => {
		if (inputsRefs.current[fieldName]) {
			const { element: { value }, rules } = inputsRefs.current[fieldName];

			if (rules) {
				const fieldErrors = {};

				// We iterate over the rules object for the current formfield.
				// For each rule, we store the validator method's return value inside the temporary fieldErrors object.
				// If said validator method returns an empty string, it means the validation was successful and we store undefined.
				// Undefined error keys are then filtered out of the temporary object, which is then stored in the formstate's errors field.
				Object.entries(rules).forEach(([rule, validator]) => {
					fieldErrors[rule] = validator(value) || undefined;
				});

				formStateRef.current.errors[fieldName] = Object.fromEntries(Object.entries(fieldErrors).filter(([, v]) => v));

				if (shouldUpdateState) {
					syncStateWithRef();
				}
			}
		} else if (process.env.NODE_ENV !== 'production') {
			logger.warn(`tried to apply form validation on unreferenced field ${fieldName}`);
		}
	};

	/**
	 * @function
	 * @name validateForm
	 * @description Performs a validation check on each registered input.
	 *
	 * @author Timothée Simon-Franza
	 */
	const validateForm = () => {
		Object.values(inputsRefs.current).forEach(({ name }) => validateField(false)(name));
		syncStateWithRef();
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
			validateField(false)(formFieldRef.name);
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
			delete formStateRef.current.errors[formFieldRefName];
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
		formState,
		getFieldsRefs,
		getFormValues,
		handleSubmit,
		registerWrapper,
		validateField: validateField(true),
	};
};

export default useForm;
