import { useCallback, useRef, useState } from 'react';
import logger from '../utils/logger';

/**
 * @name useForm
 * @description A hook providing several method to control forms.
 *
 * @author Timothée Simon-Franza
 *
 * @param {bool} [validateOnChange] Whether or not a field should trigger a validation check on change.
 */
const useForm = ({ validateOnChange = false } = {}) => {
	const inputsRefs = useRef({});
	const formStateRef = useRef({
		errors: {},
		isDirty: false,
	});
	const [formState, setFormState] = useState({ ...formStateRef.current });

	/**
	 * @function
	 * @name syncStateWithRef
	 * @description Syncs the exported formState object with the current formStateRef value.
	 *
	 * @author Timothée Simon-Franza
	 */
	const syncStateWithRef = useCallback(() => setFormState({ ...formStateRef.current }), [formStateRef]);

	/**
	 * @function
	 * @name getFieldValue
	 * @description Returns a field's value in a format that can be used with Object.fromEntries().
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {object} field The field to retrieve the value from.
	 *
	 * @returns {array}
	 */
	const getFieldValue = (field) => {
		const { name, ref: { value } } = field;

		return [name, value];
	};

	/**
	 * @function
	 * @name getFieldArrayValues
	 * @description Returns the values of a fieldArray in a format that can be used with Object.fromEntries().
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {object} fieldArrayFieldsList The fieldArray reference to retrieve values from.
	 *
	 * @returns {array}
	 */
	const getFieldArrayValues = (fieldArrayFieldsList) => {
		const { name, rules, ...fields } = fieldArrayFieldsList;

		return [name, Object.values(fields).map(({ ref: { value } }) => value)];
	};

	/**
	 * @function
	 * @name getFormValues
	 * @description Returns the value of all controlled fields as an object.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @returns {object}
	 */
	const getFormValues = useCallback(() => {
		const formValues = Object.values(inputsRefs.current)
			.filter((ref) => ref)
			.map(({ isFieldArray, ...fieldRef }) => (
				isFieldArray
					? getFieldArrayValues(fieldRef)
					: getFieldValue(fieldRef)
			));

		return Object.fromEntries(formValues);
	}, [inputsRefs]);

	// @TODO: find a way to validate nested field structures to have only one validation method.
	/**
	 * @function
	 * @name validateFieldArray
	 * @description Performs a validation check on all inputs of a specific field array.
	 *
	 * @param {string} fieldArrayName The name of the field array to perform validation on.
	 */
	const validateFieldArray = useCallback((shouldUpdateState) => (fieldArrayName) => {
		if (inputsRefs.current[fieldArrayName]) {
			const { name, rules, ...fields } = inputsRefs.current[fieldArrayName];

			if (rules) {
				Object.values(fields).filter(({ ref }) => ref).forEach((field) => {
					const { ref: { value } } = field;
					const fieldErrors = {};

					Object.entries(rules).forEach(([rule, validator]) => {
						fieldErrors[rule] = validator(value) || undefined;
					});

					if (!formStateRef.current.errors[fieldArrayName]) {
						formStateRef.current.errors[fieldArrayName] = {};
					}

					formStateRef.current.errors[fieldArrayName][field.name] = Object.fromEntries(
						Object.entries(fieldErrors).filter(([, v]) => v)
					);
				});

				if (shouldUpdateState) {
					syncStateWithRef();
				}
			}
		} else if (process.env.NODE_ENV !== 'production') {
			logger.warn(`tried to apply field array validation on a non-field array item ${fieldArrayName}`);
		}
	}, [syncStateWithRef]);

	/**
	 * @function
	 * @name validateField
	 * @description Performs a validation check on the requested input.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {string} fieldName The name of the field to perform validation on.
	 */
	const validateField = useCallback((shouldUpdateState) => (fieldName) => {
		if (inputsRefs.current[fieldName] && inputsRefs.current[fieldName].isFieldArray) {
			validateFieldArray(shouldUpdateState)(fieldName);
		} else if (inputsRefs.current[fieldName]) {
			const { ref: { value }, rules } = inputsRefs.current[fieldName];

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
			}

			if (shouldUpdateState) {
				syncStateWithRef();
			}
		} else if (process.env.NODE_ENV !== 'production') {
			logger.warn(`tried to apply form validation on unreferenced field ${fieldName}`);
		}
	}, [syncStateWithRef, validateFieldArray]);

	/**
	 * @function
	 * @name validateForm
	 * @description Performs a validation check on each registered input.
	 *
	 * @author Timothée Simon-Franza
	 */
	const validateForm = useCallback(() => {
		Object.values(inputsRefs.current).forEach(({ name }) => validateField(false)(name));
		syncStateWithRef();
	}, [syncStateWithRef, validateField]);

	/**
	 * @function
	 * @name registerFormField
	 * @description A callback method used by controlled form fields to register themselves to the form.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {object} fieldRef The ref to register.
	 */
	const registerFormField = useCallback((fieldRef) => {
		if (fieldRef.name) {
			inputsRefs.current[fieldRef.name] = fieldRef;
			validateField(false)(fieldRef.name);
		}
	}, [inputsRefs, validateField]);

	/**
	 * @function
	 * @name unregisterFormField
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
	 * @name register
	 * @description Method used to register an input to its parent form. It will return its name, options and ref callback method.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {string}	name	The input's name.
	 * @param {object}	[rules]	Optional validation methods to apply to the input.
	 *
	 * @throws Will throw an error if called without a name attribute.
	 */
	const register = useCallback(({ name, rules = {}, ...options }) => {
		if (!name || name.trim().length === 0) {
			throw new Error(`${logger.PREFIX} : Attempting to register a form field without a name property.`);
		}

		/**
		 * Saves the reference to the inputsRefs object.
		 * If the input is registered for the first time, we
		 * If it has already been registered (eg : the form has been re-rendered), we simply
		 * 	update the reference of the input, without overriding the rest.
		 */
		const isInitialRegister = !inputsRefs.current[name];

		inputsRefs.current[name] = {
			...(isInitialRegister
				? { name }
				: {
					ref: (inputsRefs.current[name] || {}).ref,
					...inputsRefs.current[name],
				}),
			name,
			rules,
			...options,
		};

		const fieldProps = {
			name,
			ref: (ref) => (ref
				? registerFormField({ name, ref, rules, ...options })
				: unregisterFormField(name)
			),
			...options,
		};

		if (validateOnChange) {
			// @TODO: handle select, checkbox and radio button onChange implementation.
			fieldProps.onChange = () => validateField(true)(name);
		}

		return fieldProps;
	}, [registerFormField, unregisterFormField, validateField, validateOnChange]);

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
	const handleSubmit = useCallback((event) => {
		event.preventDefault();
		validateForm();

		return getFormValues();
	}, [getFormValues, validateForm]);

	/**
	 * @function
	 * @name getFieldsRefs
	 * @description Returns a list of all controlled fields.
	 *
	 * @returns {object}
	 */
	const getFieldsRefs = useCallback(() => (inputsRefs.current), [inputsRefs]);

	return {
		formContext: {
			fieldsRef: inputsRefs,
			formStateRef,
			validateOnChange,
			validateField: validateField(true),
			validateFieldArray: validateFieldArray(true),
		},
		formState,
		getFieldsRefs,
		getFormValues,
		handleSubmit,
		register,
		validateField: validateField(true),
	};
};

export default useForm;
