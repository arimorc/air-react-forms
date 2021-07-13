import isEqual from 'lodash.isequal';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import FormContext from '../FormContext';
import logger from '../utils/logger';

/**
 * @name useRadioButtonGroup
 * @description A hook to be used with the useForm hook, allowing you to manage radio buttons.
 *
 * @author Timothée Simon-Franza
 *
 * @param {string}	defaultValue	Optional string used to set "checked" by default on radio typed inputs. Must match the value of the input.
 * @param {string}	name			The name to store all radio-button inputs under in the form inputs reference list.
 * @param {object}	[rules]			Validation rules to apply to the inputs as a group.
 * @param {object}	[context]		THe form context provided by useForm, obligatory only if useRadioButtonGroup is called inside the same component as useForm.
 */
const useRadioButtonGroup = ({ defaultValue = undefined, name: radioButtonGroupName, rules = {} }, context) => {
	const formContext = useContext(FormContext) ?? context;

	if (!formContext) {
		logger.fatal('useRadioButtonGroup has been called outside of a FormProvider (you can give formContext to useRadioButtonGroup directly as a parameter)');
	}

	const {
		fieldsRef,
		formStateRef,
		validateOnChange,
		validateRadioButtonGroup,
	} = formContext;

	const [fields, setFields] = useState({});
	const [errors, setErrors] = useState(() => formContext.formStateRef?.current?.errors[radioButtonGroupName] ?? []);

	/**
	 * @function
	 * @name registerRadioButton
	 * @description A callback method used by a radio typed input to register itself to its group.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {object} radioButtonRef The referenced input to register.
	 */
	const registerRadioButton = useCallback((radioButtonRef) => {
		if (radioButtonRef.value) {
			fieldsRef.current[radioButtonGroupName][radioButtonRef.value] = radioButtonRef;
		}
	}, [fieldsRef, radioButtonGroupName]);

	/**
	 * @function
	 * @name unregisterRadioButton
	 * @description A callback method used by a radio typed input to unregister itself from its parent group.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {string} radioButtonValue The value under which the input's ref has been registered.
	 */
	const unregisterRadioButton = useCallback((radioButtonValue) => {
		if (fieldsRef.current[radioButtonGroupName]?.[radioButtonValue]) {
			delete fieldsRef.current[radioButtonGroupName][radioButtonValue];
			// @TODO: implement a way to remove the related field from the formState's errors object when all radio buttons have unmounted.
		}
	}, [fieldsRef, radioButtonGroupName]);

	/**
	 * @function
	 * @name register
	 * @description Method used to register a radio typed input to its parent group and form. It return will its name, options and a ref callback method.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {string}	value				The value of the input to register
	 * @param {bool}	[defaultChecked]	Whether the input should be checked by default.
	 *
	 * @returns {object} The props to provide to the field instigating the call to this method.
	 */
	const register = useCallback(({ value, defaultChecked = false, ...additionalProps } = {}) => {
		if (value === null || value === undefined) {
			return undefined;
		}

		if (!fieldsRef.current[radioButtonGroupName]) {
			fieldsRef.current[radioButtonGroupName] = {
				isRadioButtonGroup: true,
				name: radioButtonGroupName,
				rules,
			};
		}

		const inputId = `${radioButtonGroupName}-${value}`;
		// Determines whether this call is the first registration call made by the field or not.
		const isInitialRegister = !fieldsRef.current[radioButtonGroupName][value];

		/**
		 * Saves the reference to the {@link fieldsRef} object.
		 * If it is its first registration call, we simply register the provided data.
		 * If it has already been registered (eg: the form has been re-rendered), we simply update the reference
		 * 		to the input without overriding the rest.
		 */
		fieldsRef.current[radioButtonGroupName][value] = {
			...(isInitialRegister
				? { value }
				: {
					ref: fieldsRef.current[radioButtonGroupName][value]?.ref,
					...fieldsRef.current[radioButtonGroupName][value],
				}),
			id: inputId,
			name: radioButtonGroupName,
			value,
			...additionalProps,
		};

		/**
		 * These are the props to pass down to the input when it gets rendered.
		 * 	It contains the provided props with unique id and value, alongside a
		 * 	ref callback method, allowing us to properly manage ref handling.
		 */
		const fieldProps = {
			...additionalProps,
			id: inputId,
			name: radioButtonGroupName,
			defaultChecked: defaultChecked || defaultValue === value,
			type: 'radio',
			value,
			ref: (ref) => (ref
				? registerRadioButton({ value, ref, ...additionalProps })
				: unregisterRadioButton(value)
			),
		};

		if (validateOnChange) {
			fieldProps.onChange = () => validateRadioButtonGroup(true)(radioButtonGroupName);
		}

		/**
		 * This condition is used to avoid re-rendering loops.
		 * 	The actual ref registration is made using the ref callback method in the fieldProps object,
		 * 	so that the ref can be properly managed on mount and re-renders. The fields state is used
		 * 	by the form to acknowledge the existence of a field that needs to be rendered.
		 */
		if (!fields[value]) {
			setFields({ ...fields, [value]: { id: inputId, value } });
		}

		return fieldProps;
	}, [defaultValue, fields, fieldsRef, radioButtonGroupName, registerRadioButton, rules, unregisterRadioButton, validateOnChange, validateRadioButtonGroup]);

	const getFields = useMemo(() => Object.values(fields), [fields]);

	useEffect(() => {
		const value = formStateRef.current?.errors[radioButtonGroupName] ?? {};

		if (!isEqual(value, errors)) {
			setErrors(formStateRef.current?.errors[radioButtonGroupName] ?? {});
		}
	}, [errors, formStateRef, radioButtonGroupName]);

	return {
		fields: getFields,
		register,
		errors,
		// Methods exported to simplify the testing process.
		unitTestingExports: {
			registerRadioButton,
			unregisterRadioButton,
		},
	};
};

export default useRadioButtonGroup;
