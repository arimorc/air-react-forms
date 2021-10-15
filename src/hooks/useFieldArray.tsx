import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';
import update from 'immutability-helper';
import defaultFormContext from 'FormContext';
import { Field, IFieldReturnProps } from 'types/field';
import { FieldArray, IUseFieldArrayProps, IUseFieldArrayReturn } from 'types/fieldArray';
import { FieldElement, IFormElementProps } from 'types/formElement';
import { IFormContext } from 'types/form';

/**
 * @function
 * @name useFieldArray
 * @description A hook used to control dynamic array of a same field.
 *
 * @author Timothée Simon-Franza
 *
 * @param {IUseFieldArrayProps}	registrationOptions	The data to identify and configure the fieldArray with.
 * @param {IFormContext}		context				The context of the form that encloses the field array.
 *
 * @returns {IUseFieldArrayReturn}
 */
const useFieldArray = (registrationOptions: IUseFieldArrayProps, context: IFormContext): IUseFieldArrayReturn => {
	const formContext = useContext(defaultFormContext) ?? context;
	const indexRef = useRef(0);

	// Note: this state is used to ensure any changes to the fields triggers a re-render.
	// Any manipulation on the fieldArray's children fields should be executed on fieldArray.fields, not this state.
	const [fields, setFields]: [{ [key: string]: Field }, React.Dispatch<React.SetStateAction<{[key: string]: Field }>>] = useState({});

	/**
	 * @constant
	 * @name fieldArray
	 * @description The reference to the current field array inside the formContext's "fields" constant.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @returns {FieldArray}
	 */
	const fieldArray: FieldArray = useMemo(() => {
		if (!formContext.fields[registrationOptions.name]) {
			formContext.fields[registrationOptions.name] = new FieldArray(registrationOptions);
		}

		return formContext.fields[registrationOptions.name];
	}, [formContext, registrationOptions]);

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
		}
	}, [fieldArray.fields]);

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
	 * @name register
	 * @description The method to pass down to a React JSX input to register it as part of a field array.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {IFormElementProps} fieldData The data to use in order to register the field.
	 *
	 * @returns {IFieldReturnProps}
	 */
	const register = useCallback((fieldData: IFormElementProps): IFieldReturnProps => {
		const fieldName = fieldData.name ?? `${fieldArray.name}-${indexRef.current}`;
		if (!fieldData.name) {
			indexRef.current++;
		}

		const field: Field = fieldArray.fields[fieldName] ?? new Field(fieldData);
		if (!fieldArray.fields[fieldName]) {
			fieldArray.addField(field);
		}

		const returnedProps: IFieldReturnProps = {
			...Field.extractFieldProps(field),
			ref: (ref: FieldElement) => (ref ? registerField(field, ref) : unregisterField(field)),
		};

		if (formContext.validateOnChange) {
			returnedProps.onChange = () => validateField(true)(field);
		}

		if (!fields[fieldName]) {
			setFields((prevState) => ({ ...prevState, [fieldName]: field }));
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
	 * @returns {IFieldReturnProps}
	 */
	const append = useCallback((): IFieldReturnProps => {
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
		validateField,
	};
};

export default useFieldArray;
