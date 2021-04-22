import { useCallback, useMemo, useRef, useState } from 'react';

/**
 * @name useFieldArray
 * @description A hook to be used with the useForm hook, allowing you to dynamically create and manage field arrays.
 *
 * @author Timothée Simon-Franza
 *
 * @param {object} formContext	The context provided by the useForm hook.
 * @param {string} name			The name to store all inputs under in the form inputs references.
 */
const useFieldArray = ({ formContext, name: fieldArrayName }) => {
	const {
		fieldsRef,
	} = formContext;
	const [fields, setFields] = useState({});
	const indexRef = useRef(0);

	/**
	 *
	 * @returns
	 */
	const getFieldsValues = () => ([]);

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
		}
	}, [fieldsRef, fieldArrayName]);

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
			// delete formStateRef.current.errors[fieldArrayName][fieldName];
		}
	}, [fieldsRef, fieldArrayName]);

	/**
	 * @function
	 * @name register
	 * @description Method used to register an input to its parent fieldArray and form. It will return its name, options and a ref callback method.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {string} [name] : The name of the input to register.
	 */
	const register = useCallback(({ name = undefined, ...additionalProps } = {}) => {
		if (!fieldsRef.current[fieldArrayName]) {
			fieldsRef.current[fieldArrayName] = {};
		}

		const inputName = name ?? `${fieldArrayName}.${indexRef.current}`;
		if (!name) {
			indexRef.current++;
		}

		const isInitialRegister = !fieldsRef.current[fieldArrayName][inputName];

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
			ref: (ref) => (ref
				? registerField({ name: inputName, ref, ...additionalProps })
				: unregisterField(inputName)
			),
		};

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
	}, [fields, fieldsRef, fieldArrayName, registerField, unregisterField]);

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

	return {
		fields: getFields,
		getFieldsValues,
		register,
		append: register,
		remove,
	};
};

export default useFieldArray;
