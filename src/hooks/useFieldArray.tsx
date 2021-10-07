import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import update from 'immutability-helper';
import defaultFormContext from 'defaultFormContext';
import { Field, FieldProps } from 'types/field';
import { FieldArray } from 'types/fieldArray';
import { FieldElement, FormElementRegistration } from 'types/formElement';
import { UseFieldArrayReturnType } from 'types/useFieldArray';
import { FormContext } from 'types/useForm';

interface FieldArrayDataRegistration extends FormElementRegistration {
	type?: string;
}

/**
 *
 * @param param0
 * @param context
 */
const useFieldArray = (registrationOptions: FieldArrayDataRegistration, context: FormContext): UseFieldArrayReturnType => {
	const formContext = useContext(defaultFormContext) ?? context;
	const indexRef = useRef(0);

	const [fields, setFields]: [{ [key: string]: Field }, React.Dispatch<React.SetStateAction<{[key: string]: Field }>>] = useState({});

	const fieldArray: FieldArray = useMemo(() => {
		if (!formContext.fields[registrationOptions.name]) {
			formContext.fields[registrationOptions.name] = new FieldArray(registrationOptions);
		}

		return formContext.fields[registrationOptions.name];
	}, [formContext, registrationOptions]);

	/**
	 * @function
	 * @name registerField
	 * @description A callback method used by a fieldArray input to register itself to its parent.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {Field}			field	The field to update the reference of.
	 * @param {FieldElement}	ref		The element to update the field's reference with.
	 */
	const registerField = useCallback((field: Field, ref: FieldElement): void => {
		if (field.name) {
			fieldArray.fields[field.name] = field;
			fieldArray.fields[field.name].ref.current = ref;
			formContext.validateField(false)(field);
		}
	}, [fieldArray.fields, formContext]);

	/**
	 * @function
	 * @name unregisterField
	 * @description A callback method used by a fieldArray input to unregister itself from its parent.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {Field} field The field to remove.
	 */
	const unregisterField = useCallback((field: Field): void => {
		if (fieldArray.fields[field.name]) {
			delete fieldArray.fields[field.name];
		}
	}, [fieldArray.fields]);

	/**
	 * @function
	 * @name validateField
	 * @description Performs validation checks on the provided field.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {boolean}	shouldRefreshFormState	If set to true, the state will be updated after the validation process.
	 * @param {Field}	field					The field to perform the validation check on.
	 */
	const validateField = useCallback((shouldRefreshFormState = false) => (field: Field): void => {
		if (!formContext.fields?.[registrationOptions.name]?.fields?.[field.name]) {
			return;
		}

		if (!formContext.formErrorsRef.current[registrationOptions.name]) {
			formContext.formErrorsRef.current[registrationOptions.name] = {};
		}

		field.validate();
		formContext.formErrorsRef.current[registrationOptions.name][field.name] = field.errors;

		if (shouldRefreshFormState) {
			formContext.refreshFormState();
		}
	}, [formContext, registrationOptions.name]);

	/**
	 * @function
	 * @name register
	 * @description The method to pass down to a React JSX input to register it in the controlled form.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {FormElementRegistration} fieldData The data to use in order to register the field.
	 *
	 * @returns {FieldProps}
	 */
	const register = useCallback((fieldData: FormElementRegistration): FieldProps => {
		const fieldName = fieldData.name ?? `${fieldArray.name}-${indexRef.current}`;
		if (!fieldData.name) {
			indexRef.current++;
		}

		const field: Field = fieldArray.fields[fieldName] ?? new Field(fieldData);
		if (!fieldArray.fields[fieldName]) {
			fieldArray.addField(field);
		}

		const returnedProps: FieldProps = {
			...Field.extractFieldProps(field),
			ref: (ref: FieldElement) => (ref ? registerField(field, ref) : unregisterField(field)),
		};

		if (formContext.validateOnChange) {
			returnedProps.onChange = () => validateField(true)(field);
		}

		if (!fields[fieldName]) {
			setFields({ ...fields, [fieldName]: field });
		}

		return returnedProps;
	}, [fieldArray, fields, formContext.validateOnChange, registerField, unregisterField, validateField]);

	/**
	 * @function
	 * @name append
	 * @description Appends a new pristine field to the array field.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @returns {FieldProps}
	 */
	const append = useCallback((): FieldProps => {
		const fieldName = `${fieldArray.name}-${indexRef.current}`;
		indexRef.current++;

		return register({
			id: fieldName,
			name: fieldName,
			rules: registrationOptions.rules,
			defaultValue: registrationOptions.defaultValue,
			type: registrationOptions.type,
		});
	}, [fieldArray.name, register, registrationOptions]);

	/**
	 * @function
	 * @name remove
	 * @description Removes the provided field from the list of children.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {Field} field The field to remove.
	 */
	const remove = useCallback((field: Field): void => {
		unregisterField(field);
		setFields(update(fields, { $unset: [field.name] }));
	}, [fields, unregisterField]);

	return {
		append,
		fields,
		register,
		remove,
	};
};

export default useFieldArray;
