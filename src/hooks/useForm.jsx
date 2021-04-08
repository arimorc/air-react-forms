import { useCallback, useRef } from 'react';

/**
 * @name useForm
 * @description A hook providing several method to control forms.
 *
 * @author Timothée Simon-Franza
 */
const useForm = () => {
	const inputsRefs = useRef({});

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
	 * @name registerFormField
	 * @description A callback method used by controlled form fields to register themselves to the form.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {object} formFieldRef: The ref to register.
	 */
	const registerFormField = useCallback((formFieldRef) => {
		if (formFieldRef.name) {
			inputsRefs.current[formFieldRef.name] = formFieldRef;
		}
	}, [inputsRefs]);

	/**
	 * @function
	 * @name unRegisterFormField
	 * @description A callback method used by controlled form fields to unregister themselves to the form.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {object} formFieldRefName: The name under which the ref has been registered.
	 */
	const unregisterFormField = useCallback((formFieldRefName) => {
		if (inputsRefs.current[formFieldRefName]) {
			delete inputsRefs.current[formFieldRefName];
		}
	}, [inputsRefs]);

	/**
	 * @function
	 * @name handleSubmit
	 * @description A handler used to apply validation to each controlled input of the form and return their value if all are valid.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {object} event : The "form submit" event to handle.
	 *
	 * @returns {object}
	 */
	const handleSubmit = (event) => {
		event.preventDefault();

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
		getFieldsRefs,
		getFormValues,
		registerFormField,
		unregisterFormField,
		handleSubmit,
	};
};

export default useForm;
