import { useCallback, useContext, useMemo } from 'react';
import defaultFormContext from 'FormContext';
import { IFormContext } from 'types/form';
import { CheckboxGroup, IUseCheckboxGroupProps, IUseCheckboxGroupReturn } from 'types/checkboxGroup';
import { Checkbox, ICheckboxProps, ICheckboxReturnProps } from 'types/checkbox';

/**
 * @function
 * @name useCheckboxGroup
 * @description A hook used to control checkboxes with similar names as a group.
 *
 * @author Timothée Simon-Franza
 *
 * @param {IUseCheckboxGroupProps}	registrationOptions	The data to identify and configure the checkbox group with.
 * @param {IFormContext}			context				The context of the form that encloses the checkbox group.
 *
 * @returns {IUseCheckboxGroupReturn}
 */
const useCheckboxGroup = (registrationOptions: IUseCheckboxGroupProps, context: IFormContext): IUseCheckboxGroupReturn => {
	const formContext = useContext(defaultFormContext) ?? context;

	/**
	 * @constant
	 * @name checkboxGroup
	 * @description The reference to the current checkbox group inside the formContext's "fields" constant.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @returns {CheckboxGroup}
	 */
	const checkboxGroup: CheckboxGroup = useMemo(() => {
		if (!formContext.fields[registrationOptions.name]) {
			formContext.fields[registrationOptions.name] = new CheckboxGroup(registrationOptions);
		}

		return formContext.fields[registrationOptions.name] as CheckboxGroup;
	}, [formContext, registrationOptions]);

	/**
	 * @function
	 * @name validateCheckboxGroup
	 * @description Performs validation checks on the current checkbox group.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {boolean}	shouldRefreshFormState	If set to true, the state will be updated after the validation process.
	 */
	const validateCheckboxGroup = useCallback((shouldRefreshFormState = false) => {
		if (!formContext.formErrorsRef.current[registrationOptions.name]) {
			formContext.formErrorsRef.current[registrationOptions.name] = {};
		}

		checkboxGroup.validate();
		formContext.formErrorsRef.current[registrationOptions.name] = checkboxGroup.errors;

		if (shouldRefreshFormState) {
			formContext.refreshFormState();
		}
	}, [checkboxGroup, formContext, registrationOptions.name]);

	/**
	 * @function
	 * @name registerCheckbox
	 * @description A callback method used by a checkbox group input to register itself to its parent.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {Checkbox}			field	The field to update the reference of.
	 * @param {HTMLInputElement}	ref		The element to update the field's reference with.
	 */
	const registerCheckbox = useCallback((field: Checkbox, ref: HTMLInputElement): void => {
		if (field.value) {
			checkboxGroup.fields[field.value] = field;
			checkboxGroup.fields[field.value].ref.current = ref;
		}
	}, [checkboxGroup.fields]);

	/**
	 * @function
	 * @name unregisterCheckbox
	 * @description A callback method used by a checkbox group input to unregister itself from its parent.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {Checkbox} field The field to remove.
	 */
	const unregisterCheckbox = useCallback((field: Checkbox): void => {
		if (checkboxGroup.fields[field.value]) {
			delete checkboxGroup.fields[field.value];
		}
	}, [checkboxGroup.fields]);

	/**
	 * @function
	 * @name register
	 * @description The method to pass down to a React JSX checkbox to register it as part of a checkbox group.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {ICheckboxProps} fieldData The data to use in order to register the field.
	 *
	 * @returns {ICheckboxReturnProps}
	 */
	const register = useCallback((fieldData: ICheckboxProps): ICheckboxReturnProps => {
		const checkbox: Checkbox = checkboxGroup.fields[fieldData.value] ?? new Checkbox({ ...fieldData, name: registrationOptions.name });

		if (!checkboxGroup.fields[fieldData.value]) {
			checkboxGroup.addField(checkbox);
		}

		const returnedProps: ICheckboxReturnProps = {
			...Checkbox.extractCheckboxProps(checkbox),
			ref: (ref: HTMLInputElement) => (ref ? registerCheckbox(checkbox, ref) : unregisterCheckbox(checkbox)),
		};

		if (formContext.validateOnChange) {
			returnedProps.onChange = () => validateCheckboxGroup(true);
		}

		return returnedProps;
	}, [checkboxGroup, formContext.validateOnChange, registerCheckbox, registrationOptions.name, unregisterCheckbox, validateCheckboxGroup]);

	return {
		register,
		validateCheckboxGroup,
	};
};

export default useCheckboxGroup;
