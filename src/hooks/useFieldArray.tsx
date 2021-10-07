import defaultFormContext from 'defaultFormContext';
import { useCallback, useContext, useMemo, useRef } from 'react';
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

	const {
		fields,
		validateField,
		validateOnChange,
	} = formContext;

	const fieldArray: FieldArray = useMemo(() => {
		if (!fields[registrationOptions.name]) {
			fields[registrationOptions.name] = new FieldArray(registrationOptions);
		}

		return fields[registrationOptions.name];
	}, [fields, registrationOptions]);

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
			validateField(false)(field);
		}
	}, [fieldArray.fields, validateField]);

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

		if (validateOnChange) {
			returnedProps.onChange = () => validateField(true)(field);
		}

		return returnedProps;
	}, [fieldArray, registerField, unregisterField, validateField, validateOnChange]);

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
		console.log('append');
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

	return {
		append,
		fields: fieldArray.fields,
		register,
	};
};

export default useFieldArray;
