import { useCallback, useContext, useMemo } from 'react';
import defaultFormContext from 'FormContext';
import { IFormContext } from 'types/form';
import { IRadioButtonProps, IRadioButtonReturnProps, RadioButton } from 'types/radioButton';
import { IUseRadioButtonGroupProps, IUseRadioButtonGroupReturn, RadioButtonGroup } from 'types/radioButtonGroup';

/**
 * @function
 * @name useRadioButtonGroup
 * @description A hook used to control radio buttons with similar name as a group.
 *
 * @author Timothée Simon-Franza
 *
 * @param {IUseRadioButtonGroupProps}	registrationOptions	The data to identify and configure the radio button group with.
 * @param {IFormContext}				context				The context of the form that encloses the radio button group.
 *
 * @returns {IUseRadioButtonGroupReturn}
 */
const useRadioButtonGroup = (registrationOptions: IUseRadioButtonGroupProps, context: IFormContext): IUseRadioButtonGroupReturn => {
	const formContext = useContext(defaultFormContext) ?? context;

	/**
	 * @constant
	 * @name radioButtonGroup
	 * @description The reference to the current radio button group inside the formContext's "fields" constant.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @returns {RadioButtonGroup}
	 */
	const radioButtonGroup: RadioButtonGroup = useMemo(() => {
		if (!formContext.fields[registrationOptions.name]) {
			formContext.fields[registrationOptions.name] = new RadioButtonGroup(registrationOptions);
		}

		return formContext.fields[registrationOptions.name] as RadioButtonGroup;
	}, [formContext.fields, registrationOptions]);

	/**
	 * @function
	 * @name validateRadioButtonGroup
	 * @description Performs a validation check on the current radio button group.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {boolean} shouldRefreshFormState If set to true, the state will be updated after the validation process.
	 */
	const validateRadioButtonGroup = useCallback((shouldRefreshFormState = false) => {
		if (!formContext.formErrorsRef.current[registrationOptions.name]) {
			formContext.formErrorsRef.current[registrationOptions.name] = {};
		}

		radioButtonGroup.validate();
		formContext.formErrorsRef.current[registrationOptions.name] = radioButtonGroup.errors;

		if (shouldRefreshFormState) {
			formContext.refreshFormState();
		}
	}, [formContext, radioButtonGroup, registrationOptions.name]);

	/**
	 * @function
	 * @name registerRadioButton
	 * @description A callback method used by a radio button group input to register itself to its parent.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {RadioButton}			field	The field to update the reference of.
	 * @param {HTMLInputElement}	ref		The element to update the field's reference with.
	 */
	const registerRadioButton = useCallback((field: RadioButton, ref: HTMLInputElement): void => {
		if (field.value) {
			radioButtonGroup.fields[field.value] = field;
			radioButtonGroup.fields[field.value].ref.current = ref;
		}
	}, [radioButtonGroup.fields]);

	/**
	 * @function
	 * @name unregisterRadioButton
	 * @description A callback method used by a radio button group input to unregister itself from its parent.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {RadioButton} field The field to remove.
	 */
	const unregisterRadioButton = useCallback((field: RadioButton): void => {
		if (radioButtonGroup.fields[field.value]) {
			delete radioButtonGroup.fields[field.value];
		}
	}, [radioButtonGroup.fields]);

	const register = useCallback((fieldData: IRadioButtonProps): IRadioButtonReturnProps => {
		const radioButton: RadioButton = radioButtonGroup.fields[fieldData.value] ?? new RadioButton({ ...fieldData, name: registrationOptions.name });

		if (!radioButtonGroup.fields[fieldData.value]) {
			radioButtonGroup.addField(radioButton);
		}

		const returnedProps: IRadioButtonReturnProps = {
			...RadioButton.extractRadioButtonProps(radioButton),
			ref: (ref: HTMLInputElement) => (ref ? registerRadioButton(radioButton, ref) : unregisterRadioButton(radioButton)),
		};

		if (formContext.validateOnChange) {
			returnedProps.onChange = () => validateRadioButtonGroup(true);
		}

		return returnedProps;
	}, [formContext.validateOnChange, radioButtonGroup, registerRadioButton, registrationOptions.name, unregisterRadioButton, validateRadioButtonGroup]);

	return {
		register,
		validateRadioButtonGroup,
	};
};

export default useRadioButtonGroup;
