import { useCallback, useContext, useMemo } from 'react';
import defaultFormContext from 'FormContext';
import { Fieldset, IUseFieldsetProps, IUseFieldsetReturn } from 'types/fieldset';
import { IFormContext } from 'types/form';
import { Field, IFieldReturnProps } from 'types/field';
import { FieldElement, IFormElementProps } from 'types/formElement';

/**
 * @function
 * @name useFieldset
 * @description A hook used to register and manage a fieldset and its fields.
 *
 * @author Timothée Simon-Franza
 *
 * @param {IUseFieldsetProps}	registrationOptions	The data to identify and configure the fieldset with.
 * @param {IFormContext}		context				The context of the form that encloses the fieldset.
 *
 * @returns {IUseFieldsetReturn}
 */
const useFieldset = (registrationOptions: IUseFieldsetProps, context: IFormContext): IUseFieldsetReturn => {
	const formContext = useContext(defaultFormContext) ?? context;

	/**
	 * @constant
	 * @name fieldset
	 * @description The reference to the current fieldset inside the formContext's "fields" constant.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @returns {Fieldset}
	 */
	const fieldset: Fieldset = useMemo(() => {
		if (!formContext.fields[registrationOptions.name]) {
			formContext.fields[registrationOptions.name] = new Fieldset(registrationOptions);
		}

		return formContext.fields[registrationOptions.name] as Fieldset;
	}, [formContext, registrationOptions]);

	/**
	 * @function
	 * @name validateFieldset
	 * @description Performs validation checks on the current fieldset.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {boolean}	shouldRefreshFormState	If set to true, the state will be updated after the validation process.
	 */
	const validateFieldset = useCallback((shouldRefreshFormState = false) => {
		if (!formContext.formErrorsRef.current[registrationOptions.name]) {
			formContext.formErrorsRef.current[registrationOptions.name] = {};
		}

		fieldset.validate();
		formContext.formErrorsRef.current[registrationOptions.name] = fieldset.errors;

		if (shouldRefreshFormState) {
			formContext.refreshFormState();
		}
	}, [fieldset, formContext, registrationOptions.name]);

	/**
	 * @function
	 * @name registerField
	 * @description A callback method used by a fieldset's field to register itself to its parent.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {Field}			field	The field to update the reference of.
	 * @param {FieldElement}	ref		The element to update the field's reference with.
	 */
	const registerField = useCallback((field: Field, ref: FieldElement): void => {
		if (field.name) {
			fieldset.fields[field.name] = field;
			fieldset.fields[field.name].ref.current = ref;
		}
	}, [fieldset.fields]);

	/**
	 * @function
	 * @name unregisterField
	 * @description A callback method used by a fieldset's field to unregister itself from its parent.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {Field} field The field to remove.
	 */
	const unregisterField = useCallback((field: Field): void => {
		if (fieldset.fields[field.name]) {
			delete fieldset.fields[field.name];
		}
	}, [fieldset.fields]);

	/**
	 * @function
	 * @name register
	 * @description The method to pass down to a React JSX input to register it as part of a fieldset.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {IFormElementProps} fieldData The data to use in order to register the field.
	 *
	 * @returns {IFieldReturnProps}
	 */
	const register = useCallback((fieldData: IFormElementProps): IFieldReturnProps => {
		const field: Field = fieldset.fields[fieldData.name] ?? new Field(fieldData);

		if (!fieldset.fields[field.name]) {
			fieldset.registerField(field);
		}

		const returnedProps: IFieldReturnProps = {
			...Field.extractFieldProps(field),
			ref: (ref: FieldElement) => (ref ? registerField(field, ref) : unregisterField(field)),
		};

		if (formContext.validateOnChange) {
			returnedProps.onChange = () => validateFieldset(true);
		}

		return returnedProps;
	}, [fieldset, formContext.validateOnChange, registerField, unregisterField, validateFieldset]);

	return {
		fields: fieldset.fields,
		register,
		validateFieldset,
	};
};

export default useFieldset;
