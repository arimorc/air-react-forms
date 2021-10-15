import * as React from 'react';
import { MutableRefObject, useCallback, useRef, useState } from 'react';
import { Field, IFieldReturnProps } from 'types/field';
import { FormData, IUseFormProps, IUseFormReturn } from 'types/form';
import { FieldElement, IFormElementProps } from 'types/formElement';
import { FieldErrors } from 'types/validation';

/**
 * @name useForm
 * @description A hook providing several methods to help controlling forms.
 *
 * @author Timothée Simon-Franza
 *
 * @param {boolean} [validateOnChange] Whether or not fields should trigger a validation check on change.
 *
 * @returns {IUseFormReturn}
 */
const useForm = (props: IUseFormProps = { validateOnChange: false }): IUseFormReturn => {
	const fields: MutableRefObject<{ [key: string]: Field }> = useRef({});

	const formErrorsRef: MutableRefObject<{ [key: string]: FieldErrors }> = useRef({});

	const [formState, setFormState] = useState({
		errors: {},
	});

	/**
	 * @function
	 * @name refreshFormState
	 * @description Updates the formState field with the latest data.
	 *
	 * @author Timothée Simon-Franza
	 */
	const refreshFormState = useCallback(() => {
		setFormState({ errors: formErrorsRef.current });
	}, []);

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
		if (!fields?.current?.[field.name]) {
			return;
		}
		field.validate();
		formErrorsRef.current[field.name] = field.errors;

		if (shouldRefreshFormState) {
			refreshFormState();
		}
	}, [refreshFormState]);

	/**
	 * @function
	 * @name registerField
	 * @description Registers a field's reference.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {Field}			field	The field to update the reference of.
	 * @param {FieldElement}	ref		The element to update the field's reference with.
	 */
	const registerField = useCallback((field: Field, ref: FieldElement): void => {
		if (field.name) {
			fields.current[field.name] = field;
			fields.current[field.name].ref.current = ref;
		}
	}, [fields]);

	/**
	 * @function
	 * @name unregisterField
	 * @description Removes the provided field from the list of controlled fields.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {Field} field The field to remove.
	 */
	const unregisterField = useCallback((field: Field): void => {
		if (fields?.current?.[field.name]) {
			delete fields.current[field.name];
		}
	}, [fields]);

	/**
	 * @function
	 * @name register
	 * @description The method to pass down to a React JSX input to register it in the controlled form.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {IFormElementProps} fieldData The data to use in order to register the field.
	 *
	 * @returns {IFieldReturnProps}
	 */
	const register = useCallback((fieldData: IFormElementProps): IFieldReturnProps => {
		const field = fields?.current?.[fieldData.name] ?? new Field(fieldData);

		if (!fields?.current?.[field.name]) {
			fields.current[field.name] = field;
			formErrorsRef.current[field.name] = undefined;
		}

		const returnedProps: IFieldReturnProps = {
			...Field.extractFieldProps(field),
			ref: (ref: FieldElement) => (ref ? registerField(field, ref) : unregisterField(field)),
		};

		if (props.validateOnChange) {
			returnedProps.onChange = () => validateField(true)(field);
		}

		return returnedProps;
	}, [props.validateOnChange, registerField, unregisterField, validateField]);

	/**
	 * @function
	 * @name getFormValues
	 * @description Returns the values of all registered fields as an object.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @returns {FormData}
	 */
	const getFormValues = useCallback(() => (
		Object.values(fields.current)
			.filter((ref) => ref)
			.reduce((values, field) => ({ ...values, [field.name]: field.value }), {})
	), []);

	/**
	 * @function
	 * @name validateForm
	 * @description Triggers a validation check on each registered element of the form.
	 *
	 * @author Timothée Simon-Franza
	 */
	const validateForm = useCallback(() => {
		Object.values(fields.current).forEach((field) => {
			validateField(true)(field);
		});
	}, [validateField]);

	/**
	 * @function
	 * @name isFormValid
	 * @description Returns whether or not the form is valid.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @returns {boolean} False if one or more fields are invalid. True otherwise.
	 */
	const isFormValid = useCallback(() => {
		const invalidFields = Object.values(fields.current)
			.reduce((acc, field) => (
				field.isValid() ? acc : acc + 1
			), 0);

		return invalidFields === 0;
	}, []);

	/**
	 * @function
	 * @name handleSubmit
	 * @description A handled method which triggers validation checks on the registered fields and calls the provided callback method if the form is valid.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {Function} callback The method to call if the form is valid.
	 */
	const handleSubmit = useCallback((callback: (formData: FormData) => void) => (event: React.FormEvent) => {
		event?.preventDefault();
		validateForm();

		if (isFormValid()) {
			callback(getFormValues());
		}
	}, [getFormValues, isFormValid, validateForm]);

	return {
		formContext: {
			fields: fields.current,
			formErrorsRef,
			register,
			getFormValues,
			isFormValid,
			refreshFormState,
			validateField,
			validateOnChange: props.validateOnChange,
		},
		formState,
		register,
		handleSubmit,
	};
};

export default useForm;
