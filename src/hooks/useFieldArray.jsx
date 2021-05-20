import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import isEqual from 'lodash.isequal';
import FormContext from '../FormContext';
import { getDefaultValueByInputType } from '../utils/inputTypeUtils';
import logger from '../utils/logger';

/**
 * @name useFieldArray
 * @description A hook to be used with the useForm hook, allowing you to dynamically create and manage field arrays.
 *
 * @author Timothée Simon-Franza
 *
 * @param {object}	[context]				The form context given by useForm, obligatory only if useFieldArray is called inside the same component as useForm.
 * @param {string}	[inputType = 'text']	The input's type. Defaults to 'text'.
 * @param {string}	name					The name to store all inputs under in the form inputs references.
 * @param {object}	[rules]					Validation rules to apply to each field inside the field array.
 */
const useFieldArray = ({ name: fieldArrayName, inputType = 'text', rules }, context) => {
	const formContext = useContext(FormContext) ?? context;

	if (!formContext) {
		logger.fatal('useFieldArray has been called outside of a FormProvider (you can give formContext to useFieldArray directly as a parameter)');
	}

	const {
		fieldsRef,
		formStateRef,
		validateOnChange,
		validateFieldArrayInput,
	} = formContext;

	const [fields, setFields] = useState({});
	const [errors, setErrors] = useState(() => formContext.formStateRef.current.errors[fieldArrayName] ?? {});

	const indexRef = useRef(0);

	/**
	 * @function
	 * @name registerField
	 * @description A callback method used by a fieldArray input to register itself to its parent.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {object} fieldRef The referenced input to register.
	 */
	const registerField = useCallback((fieldRef) => {
		if (fieldRef.name) {
			fieldsRef.current[fieldArrayName][fieldRef.name] = fieldRef;
			validateFieldArrayInput(false)(fieldRef.name, fieldArrayName, rules);
		}
	}, [fieldsRef, fieldArrayName, validateFieldArrayInput, rules]);

	/**
	 * @function
	 * @name unregisterField
	 * @description A callback method used by a fieldArray input to unregister itself from its parent.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {string} fieldName The name under which the input's ref has been registered.
	 */
	const unregisterField = useCallback((fieldName) => {
		if (fieldsRef.current[fieldArrayName] && fieldsRef.current[fieldArrayName][fieldName]) {
			delete fieldsRef.current[fieldArrayName][fieldName];
			if (formStateRef.current.errors[fieldArrayName]?.[fieldName]) {
				delete formStateRef.current.errors[fieldArrayName][fieldName];
			}
		}
	}, [fieldsRef, formStateRef, fieldArrayName]);

	/**
	 * @function
	 * @name register
	 * @description Method used to register an input to its parent fieldArray and form. It will return its name, options and a ref callback method.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {string} [name] : The name of the input to register.
	 *
	 * @returns {object} The props to provide to the field instigating the call to this method.
	 */
	const register = useCallback(({ name = undefined, defaultValue = undefined, ...additionalProps } = {}) => {
		if (!fieldsRef.current[fieldArrayName]) {
			fieldsRef.current[fieldArrayName] = {
				isFieldArray: true,
				name: fieldArrayName,
			};
			if (rules) {
				fieldsRef.current[fieldArrayName].rules = rules;
			}
		}

		const inputName = name ?? `${fieldArrayName}-${indexRef.current}`;
		if (!name) {
			indexRef.current++;
		}

		// Determines whether this call is the first registration call made by the field or not.
		const isInitialRegister = !fieldsRef.current[fieldArrayName][inputName];
		/**
		 * Saves the reference to the {@link fieldsRef} object.
		 * 	If it is its first registration call, we simply register its name, id, defaultValue and options.
		 *	If it has already been registered (eg: the form has been re-rendered), we simply update the reference
		 *		to the input, without overriding the rest.
		 */
		fieldsRef.current[fieldArrayName][inputName] = {
			...(isInitialRegister
				? { name: inputName }
				: {
					ref: (fieldsRef.current[fieldArrayName][inputName] || {}).ref,
					...fieldsRef.current[fieldArrayName][inputName],
				}),
			id: inputName,
			name: inputName,
			...additionalProps,
		};

		/**
		 * These are the props to pass down to the input when it gets rendered.
		 *	it contains the provided props with unique id and name, alongside a
		 *	ref callback method, allowing us to properly manage ref handling.
		 */
		const fieldProps = {
			...additionalProps,
			id: inputName,
			name: inputName,
			defaultValue: defaultValue ?? getDefaultValueByInputType(inputType),
			type: inputType,
			ref: (ref) => (ref
				? registerField({ name: inputName, ref, ...additionalProps })
				: unregisterField(inputName)
			),
		};

		if (validateOnChange) {
			// @TODO: handle select, checkbox and radio button onChange implementation.
			fieldProps.onChange = () => validateFieldArrayInput(true)(inputName, fieldArrayName, rules);
		}

		/**
		 * This condition is used to avoid re-rendering loops.
		 * 	the actual ref registration is made using the ref callback method in the fieldProps object,
		 * 	so that the ref can be properly managed on mount and re-renders. The fields state
		 *  is used by the form to acknowledge the existence of a field that needs to be rendered.
		 */
		if (!fields[inputName]) {
			setFields({ ...fields, [inputName]: { id: inputName, name: inputName } });
		}

		return fieldProps;
	}, [fieldsRef, fieldArrayName, inputType, validateOnChange, fields, rules, registerField, unregisterField, validateFieldArrayInput]);

	/**
	 * @function
	 * @name remove
	 * @description A callback method used to remove a fieldArray input.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {string} name The name under which the input's ref has been registered.
	 */
	const remove = useCallback(({ name: toRemove }) => {
		const { [toRemove]: removedField, ...updatedFields } = { ...fields };

		setFields(updatedFields);
		unregisterField(toRemove);
	}, [fields, unregisterField]);

	const getFields = useMemo(() => (Object.values(fields)), [fields]);

	/* istanbul ignore next */
	useEffect(() => {
		const value = formStateRef.current.errors[fieldArrayName] ?? {};

		if (!isEqual(value, errors)) {
			setErrors(formStateRef.current.errors[fieldArrayName] ?? {});
		}
	}, [errors, fieldArrayName, formStateRef]);

	return {
		fields: getFields,
		register,
		remove,
		errors,
	};
};

export default useFieldArray;
