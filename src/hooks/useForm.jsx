import { useCallback, useRef, useState } from 'react';
import isEmpty from 'lodash.isempty';
import logger from '../utils/logger';
import { getDefaultValueByInputType, isCheckbox } from '../utils/inputTypeUtils';

/**
 * @name useForm
 * @description A hook providing several method to control forms.
 *
 * @author Timothée Simon-Franza
 *
 * @param {bool} [validateOnChange] Whether or not a field should trigger a validation check on change.
 */
const useForm = ({ validateOnChange = false } = {}) => {
	/**
	 * @field
	 * @name inputsRefs
	 * @description A reference object containing a list of all controlled inputs of the linked form component.
	 */
	const inputsRefs = useRef({});

	/**
	 * @field
	 * @name formStateRef
	 * @description A reference object containing the current form's state information, such as validation errors.
	 */
	const formStateRef = useRef({
		errors: {},
		isDirty: false,
	});

	/**
	 * @field
	 * @name formState
	 * @description The state object linked to the {@link formStateRef} object above, used to notify the form component a change has happened to the form.
	 *
	 * You can perform said notification by using the {@link syncStateWithRef} method down below.
	 */
	const [formState, setFormState] = useState({ ...formStateRef.current });

	/**
	 * @function
	 * @name syncStateWithRef
	 * @description Syncs the exported formState object with the current formStateRef value to notify the linked form of any change to the state.
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
		// @TODO: handle multiple checkbox with same name but different values
		if (isCheckbox(field?.ref)) {
			return [field.name, field.ref.checked];
		}

		const { name, ref: { value = undefined } = {} } = field;

		return [name, value];
	};

	/**
	 * @function
	 * @name getFieldArrayValues
	 * @description Returns the values of a fieldArray in a format that can be used with Object.fromEntries().
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {object} fieldArray The fieldArray reference to retrieve values from.
	 *
	 * @returns {array}
	 */
	const getFieldArrayValues = (fieldArray) => {
		const { name, rules, ...fields } = fieldArray;

		const values = Object.values(fields)
			.filter(({ ref }) => ref)
			.map(({ ref: { value } }) => value);

		return [name, values];
	};

	/**
	 * @function
	 * @getCheckboxGroupValues
	 * @description Returns the values of a checkbox group in a format that can be used with Object.fromEntries().
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {object} checkboxGroup The checkbox group reference to retrieve values from.
	 *
	 * @returns {array}
	 */
	const getCheckboxGroupValues = (checkboxGroup) => {
		const { name, rules, ...fields } = checkboxGroup;

		const values = Object.values(fields)
			.filter(({ ref }) => ref)
			.reduce((acc, { ref: { value, checked } }) => {
				acc[value] = checked;

				return acc;
			}, {});

		return [name, values];
	};

	/**
	 * @function
	 * @name getFormValues
	 * @description Returns the value of all controlled fields as an object.
	 *
	 * To achieve that, this method maps over each field registered in the form. If a field is a fieldArray,
	 * 	it calls the {@link getFieldArrayValues} method. Else, it calls the {@link getFieldValue} method.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @returns {object}
	 */
	const getFormValues = useCallback(() => {
		const formValues = Object.values(inputsRefs.current)
			.filter((ref) => ref) // To ignore fields that are yet to be registered or garbage collected.
			.map(({ isFieldArray, isCheckboxGroup, ...fieldRef }) => {
				if (isFieldArray) {
					return getFieldArrayValues(fieldRef);
				}

				if (isCheckboxGroup) {
					return getCheckboxGroupValues(fieldRef);
				}

				return getFieldValue(fieldRef);
			});

		return Object.fromEntries(formValues);
	}, [inputsRefs]);

	/**
	 * @function
	 * @name validate
	 * @description Method used to perform validation checks on the provided field. If the provided field is a fieldArray, this method will perform recursive calls to itself.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {object} field				The field to perform validation checks on. Must be from the inputsRef reference object.
	 * @param {object} [validationRules]	Optional parameter used to pass down rules from a fieldArray to its fields.
	 *
	 * @returns {object} An object in the following format : { fieldName: { validationKey1: string, validationKey2: string, ... } }
	 */
	const validate = useCallback((field, validationRules = {}) => {
		if (!field) {
			return {};
		}

		const fieldErrors = {};

		if (field.isFieldArray) {
			const { name, rules = {}, isFieldArray, ...fields } = field;

			if (rules && !isEmpty(rules)) {
				/**
				 * Retrieves all fields references, then map over each of them to apply validation checks using recursion.
				 *	The validation results are in the following format fieldName: { validationKey1: string, validation2: string, ... }.
				 *	We them map over them to get a final validation object formatted in the following way :
				 *	{
				 *		fieldName1: { validationKey1: string, validationKey2: string, ... },
				 *		fieldName2: { validationKey1: string, validationKey2: string, ... }
				 *		...
				 *	}
				 */
				const validationResults = Object.values(fields)
					.map((pField) => validate(pField, rules))
					.map((validationResult) => Object.entries(validationResult)[0]);

				fieldErrors[field.name] = Object.fromEntries(validationResults);

				return fieldErrors;
			}
		} else {
			const rules = field.rules ?? validationRules;

			if (rules && !isEmpty(rules) && field.ref?.value !== undefined) {
				/**
				 * For each rule, we call its linked validator method and store the result in the fieldErrors temporary object.
				 * If the validator doesn't exist or returns nothing, we assign undefined to perform garbage collection.
				 */
				Object.entries(rules).forEach(([rule, validator]) => {
					fieldErrors[rule] = validator(field.ref.value) || undefined;
				});
			}
		}

		const result = { [field.name]: Object.fromEntries(Object.entries(fieldErrors)) };

		return result;
	}, []);

	/**
	 * @function
	 * @name validateFieldArrayInput
	 * @description Method used to perform validation checks on the provided field, using its parent fieldArray name and validation rules. Uses {@link validate}.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {bool}	shouldUpdateState	Whether the validation should update the form's state object to match the ref version after validation is done.
	 *
	 * @param {string}	fieldName			The name of the field to perform validation checks on.
	 * @param {string}	fieldArrayName		The name of the field's parent. Used to update the form's state's error field.
	 * @param {object}	[validationRules]	The field's parent's validation rules to apply on the current field.
	 */
	const validateFieldArrayInput = useCallback((shouldUpdateState) => (fieldName, fieldArrayName, validationRules = {}) => {
		if (!inputsRefs.current?.[fieldArrayName]) {
			logger.warn(`tried to apply field validation on field from a non-registered field array ${fieldArrayName}`);

			return;
		}

		if (!inputsRefs.current?.[fieldArrayName]?.[fieldName]) {
			logger.warn(`tried to apply field validation on a non-registered field ${fieldName}`);

			return;
		}
		// If no records of the current fieldArray exists in the form's state, we create an empty one to avoid null pointers issues.
		if (!formStateRef.current.errors[fieldArrayName]) {
			formStateRef.current.errors[fieldArrayName] = {};
		}

		// We avoid unnecessary resource usage by skipping the calculations when there is no validation rules to check.
		if (!isEmpty(validationRules)) {
			// Assigns the result of the 'validate' method call to the formState ref's related error field.
			// This uses array destructuring to access only the list of validation and their results, therefor avoiding nesting.
			[formStateRef.current.errors[fieldArrayName][fieldName]] = Object.values(validate(inputsRefs.current[fieldArrayName][fieldName], validationRules));

			if (shouldUpdateState) {
				syncStateWithRef();
			}
		}
	}, [syncStateWithRef, validate]);

	/**
	 * @function
	 * @name validateFieldArray
	 * @description Performs a validation check on all inputs of a specific field array using the {@link validate} method.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {bool}	shouldUpdateState	Whether the validation should update the form's state object to match the ref version after validation is done.
	 * @param {string}	fieldArrayName		The name of the field array to perform validation on.
	 */
	const validateFieldArray = useCallback((shouldUpdateState) => (fieldArrayName) => {
		if (!inputsRefs.current[fieldArrayName]) {
			logger.warn(`tried to apply field validation on a non-registered field array ${fieldArrayName}`);

			return;
		}

		/**
		 * Assigns the result of the {@link validate} method call to the formState ref's related error field.
		 * This uses array destructuring to access only the list of validation and their results, therefor avoiding nesting.
		 */
		[formStateRef.current.errors[fieldArrayName]] = Object.values(validate(inputsRefs.current[fieldArrayName]));

		if (shouldUpdateState) {
			syncStateWithRef();
		}
	}, [syncStateWithRef, validate]);

	/**
	 * @function
	 * @name validateField
	 * @description Performs a validation check on the requested input using the {@link validate} method.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {bool}	shouldUpdateState	Whether the validation should update the form's state object to match the ref version after validation is done.
	 * @param {string}	fieldName			The name of the field to perform validation on.
	 */
	const validateField = useCallback((shouldUpdateState) => (fieldName) => {
		if (!inputsRefs.current[fieldName]) {
			logger.warn(`tried to apply form validation on unreferenced field ${fieldName}`);

			return;
		}

		/**
		 * Assigns the result of the {@link validate} method call to the formState ref's related error field.
		 * This uses array destructuring to access only the list of validation and their results, therefor avoiding nesting.
		 */
		[formStateRef.current.errors[fieldName]] = Object.values(validate(inputsRefs.current[fieldName]));

		if (shouldUpdateState) {
			syncStateWithRef();
		}
	}, [syncStateWithRef, validate]);

	/**
	 * @function
	 * @name validateForm
	 * @description Performs a validation check on each registered input using the {@link validateFieldArray} and {@link validateField} methods.
	 *
	 * @author Timothée Simon-Franza
	 */
	const validateForm = useCallback(() => {
		Object.values(inputsRefs.current).forEach(({ isFieldArray, name }) => (
			isFieldArray
				? validateFieldArray(false)(name)
				: validateField(false)(name)
		));

		syncStateWithRef();
	}, [syncStateWithRef, validateField, validateFieldArray]);

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
	 * Note : if the defaultValue param is not provided, inputs will be provided with the result of the {@link getDefaultValueByInputType} method.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {any}		[defaultValue]	The default value to provide to the input.
	 * @param {string}	name			The input's name.
	 * @param {object}	[rules]			Optional validation methods to apply to the input.
	 * @param {string}	[type = 'text']	The input's type. Defaults to text.
	 *
	 * @throws Will throw an error if called without a name attribute.
	 *
	 * @returns {object} The props to provide to the field instigating the call to this method.
	 */
	const register = useCallback(({ defaultValue = undefined, name, rules = {}, type = 'text', ...options }) => {
		if (!name || name.trim().length === 0) {
			throw new Error(`${logger.PREFIX} : Attempting to register a form field without a name property.`);
		}

		// Determines whether this call is the first registration call made by the field or not.
		const isInitialRegister = !inputsRefs.current[name];

		/**
		 * Saves the reference to the {@link inputsRefs} object.
		 *	If it is its first registration call, we simply register its name, validation rules and options.
		 *	If it has already been registered (eg : the form has been re-rendered), we simply
		 * 		update the reference of the input, without overriding the rest.
		 */
		inputsRefs.current[name] = {
			...(isInitialRegister
				? { name }
				: { ref: (inputsRefs.current[name] || {}).ref, ...inputsRefs.current[name] }),
			name,
			rules,
			type,
			...options,
		};

		/**
		 * The props to return to the field.
		 * We return all the arguments passed to the method, along with a ref callback method to handle (un)registration processes.
		 */
		const fieldProps = {
			defaultValue: defaultValue ?? getDefaultValueByInputType(type),
			name,
			ref: (ref) => (ref ? registerFormField({ name, ref, rules, ...options }) : unregisterFormField(name)),
			rules,
			type,
			...options,
		};

		if (validateOnChange) {
			// @TODO: handle select, checkbox and radio button onChange implementation.
			switch (type) {
				case 'checkbox': {
					fieldProps.onChange = () => validateField(true)(name);
					break;
				}
				default: {
					fieldProps.onChange = () => validateField(true)(name);
					break;
				}
			}
		}

		return fieldProps;
	}, [registerFormField, unregisterFormField, validateField, validateOnChange]);

	/**
	 * @function
	 * @name findError
	 * @description Recursive method which iterates over the item parameter's values to look for validation errors.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {object | string} item : The item to iterate over.
	 *
	 * @returns {number} The amount of errors found. If none, returns 0.
	 */
	const findError = useCallback((item) => (
		Object.entries(item)
			.reduce((acc, [, value]) => {
				if (
					value !== undefined
					&& value !== null
					&& (typeof value === 'string' && !isEmpty(value))
					&& typeof value !== 'object'
				) {
					return acc + 1; // Error.
				}

				if (typeof value === 'object' && Object.values(value).length > 0) {
					return acc + findError(value); // Recursive call.
				}

				return acc; // Field is valid.
			}, 0)
	), []);

	/**
	 * @function
	 * @name isFormValid
	 * @description Checks if the form is valid by analysing the formStateRef object.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @returns {bool} True if the form is valid, false otherwise.
	 */
	const isFormValid = useCallback(() => findError(formStateRef.current.errors) === 0, [findError]);

	/**
	 * @function
	 * @name handleSubmit
	 * @description A handler method which applies validation to all the controlled fields and calls the callback parameter if the form is valid.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {func} callback The callback method to call if the form is valid.
	 */
	const handleSubmit = useCallback((callback) => (event) => {
		event?.preventDefault();
		validateForm();

		if (isFormValid()) {
			callback(getFormValues());
		}
	}, [getFormValues, isFormValid, validateForm]);

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
			getFieldValue,
			getFormValues,
			syncStateWithRef,
			validateOnChange,
			validateField: validateField(true),
			validateFieldArrayInput,
		},
		formState,
		getFieldsRefs,
		getFormValues,
		handleSubmit,
		isFormValid,
		register,
		validateFieldArray: validateFieldArray(true),
		validateField: validateField(true),
		// Methods exported to simplify the testing process.
		unitTestingExports: {
			getFieldArrayValues,
			validate,
		},
	};
};

export default useForm;
