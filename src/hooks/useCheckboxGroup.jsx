import isEqual from 'lodash.isequal';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import FormContext from '../FormContext';
import logger from '../utils/logger';

/**
 * @name useCheckboxGroup
 * @description A hook to be used with the useForm hook, allowing you to manage checkboxes with a similar name as a group.
 *
 * @author Timothée Simon-Franza
 *
 * @param {object}	[context]		The form context provided by useForm, obligatory only if useCheckboxGroup is called inside the same component as useForm.
 * @param {object}	[defaultValues]	Optional object used to set "checked" by default on some checkboxes.
 * @param {string}	name			The name to store all checkboxes under in the form inputs references.
 * @param {object}	[rules]			Validation rules to apply to the checkboxes as a group.
 */
const useCheckboxGroup = ({ defaultValues = {}, name: checkboxGroupName, rules = {} }, context) => {
	const formContext = useContext(FormContext) ?? context;

	if (!formContext) {
		logger.fatal('useCheckboxGroup has been called outside of a FormProvider (you can give formContext to useCheckboxGroup directly as a parameter)');
	}

	const {
		fieldsRef,
		formStateRef,
		validateCheckboxGroup,
		validateOnChange,
	} = formContext;

	const [fields, setFields] = useState({});
	const [errors, setErrors] = useState(() => formContext.formStateRef.current.errors[checkboxGroupName] ?? {});

	/**
	 * @function
	 * @name registerCheckbox
	 * @description A callback method used by a checkbox typed input to register itself to its group.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {object} checkboxRef The referenced input to register.
	 */
	const registerCheckbox = useCallback((checkboxRef) => {
		if (checkboxRef.value) {
			fieldsRef.current[checkboxGroupName][checkboxRef.value] = checkboxRef;
		}
	}, [fieldsRef, checkboxGroupName]);

	/**
	 * @function
	 * @name unregisterCheckbox
	 * @description A callback method used by a checkbox typed input to unregister itself from its parent group and form.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {string} checkboxValue The value under which the input's ref has been registered.
	 */
	const unregisterCheckbox = useCallback((checkboxValue) => {
		if (fieldsRef.current[checkboxGroupName] && fieldsRef.current[checkboxGroupName][checkboxValue]) {
			delete fieldsRef.current[checkboxGroupName][checkboxValue];

			// @TODO: implement a way to remove the related field from the formState's errors object when all checkbox have unmounted.
		}
	}, [fieldsRef, checkboxGroupName]);

	/**
	 * @function
	 * @name register
	 * @description Method used to register a checkbox typed input to its parent group and form. It will return its name, options and a ref callback method.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {string}	value				The value of the input to register.
	 * @param {bool}	[defaultChecked]	Whether the checkbox should be checked by default.
	 *
	 * @returns {object} The props to provide to the field instigating the call to this method.
	 */
	const register = useCallback(({ value, defaultChecked = false, ...additionalProps } = {}) => {
		if (value === null || value === undefined) {
			return undefined;
		}

		if (!fieldsRef.current[checkboxGroupName]) {
			fieldsRef.current[checkboxGroupName] = {
				isCheckboxGroup: true,
				name: checkboxGroupName,
			};

			if (rules) {
				fieldsRef.current[checkboxGroupName].rules = rules;
			}
		}

		const inputId = `${checkboxGroupName}-${value}`;

		// Determines whether this call is the first registration call made by the field or not.
		const isInitialRegister = !fieldsRef.current[checkboxGroupName][value];

		/**
		 * Saves the reference to the {@link fieldsRef} object.
		 * 	If it is its first registration call, we simply register the provided data.
		 *	If it has already been registered (eg: the form has been re-rendered), we simply update the reference
		 *		to the input, without overriding the rest.
		 */
		fieldsRef.current[checkboxGroupName][value] = {
			...(isInitialRegister
				? { value }
				: {
					ref: fieldsRef.current[checkboxGroupName][value]?.ref,
					...fieldsRef.current[checkboxGroupName][value],
				}),
			id: inputId,
			name: checkboxGroupName,
			value,
			...additionalProps,
		};

		/**
		 * These are the props to pass down to the input when it gets rendered.
		 *	it contains the provided props with unique id and value, alongside a
		 *	ref callback method, allowing us to properly manage ref handling.
		 */
		const fieldProps = {
			...additionalProps,
			id: inputId,
			name: checkboxGroupName,
			defaultChecked: defaultChecked || (defaultValues[value] ?? false),
			type: 'checkbox',
			value,
			ref: (ref) => (ref
				? registerCheckbox({ value, ref, ...additionalProps })
				: unregisterCheckbox(value)
			),
		};

		if (validateOnChange) {
			fieldProps.onChange = () => validateCheckboxGroup(true)(checkboxGroupName);
		}

		/**
		 * This condition is used to avoid re-rendering loops.
		 * 	the actual ref registration is made using the ref callback method in the fieldProps object,
		 * 	so that the ref can be properly managed on mount and re-renders. The fields state
		 *  is used by the form to acknowledge the existence of a field that needs to be rendered.
		 */
		if (!fields[value]) {
			setFields({ ...fields, [value]: { id: inputId, value } });
		}

		return fieldProps;
	}, [fieldsRef, checkboxGroupName, defaultValues, validateOnChange, fields, rules, registerCheckbox, unregisterCheckbox, validateCheckboxGroup]);

	const getFields = useMemo(() => (Object.values(fields)), [fields]);

	/* istanbul ignore next */
	useEffect(() => {
		const value = formStateRef.current.errors[checkboxGroupName] ?? {};

		if (!isEqual(value, errors)) {
			setErrors(formStateRef.current.errors[checkboxGroupName] ?? {});
		}
	}, [checkboxGroupName, errors, formStateRef]);

	return {
		fields: getFields,
		register,
		errors,
		// Methods exported to simplify the testing process.
		unitTestingExports: {
			registerCheckbox,
			unregisterCheckbox,
		},
	};
};

export default useCheckboxGroup;
