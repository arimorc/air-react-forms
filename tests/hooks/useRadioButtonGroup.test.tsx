import React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { act } from 'react-dom/test-utils';
import renderHook from '../testUtils/renderHook';
import { useRadioButtonGroup, useForm } from '../../src';
import { RadioButtonGroup, IUseRadioButtonGroupProps, IUseRadioButtonGroupReturn } from '../../src/types/radioButtonGroup';
import { IUseFormReturn } from '../../src/types/form';
import { IRadioButton, IRadioButtonProps } from '../../src/types/radioButton';

describe('UseRadioButtonGroup hook', () => {
	let useFormResult: IUseFormReturn;
	let sut: IUseRadioButtonGroupReturn;

	const defaultRadioButtonGroupProps: IUseRadioButtonGroupProps = {
		id: 'system-under-test',
		name: 'system-under-test',
		type: 'radio',
		rules: {},
	};

	const dummyRadioButtonData: IRadioButtonProps = {
		id: `${defaultRadioButtonGroupProps.name}-0`,
		name: `${defaultRadioButtonGroupProps.name}`,
		value: 'value-0',
		type: 'radio',
		defaultChecked: false,
		checked: false,
	};

	beforeEach(() => {
		renderHook(() => {
			useFormResult = useForm();
			sut = useRadioButtonGroup(defaultRadioButtonGroupProps, useFormResult.formContext);
		});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('register', () => {
		it('should add a new RadioButton object to the radioButtonGroup\'s fields field if it is not already present', () => {
			const radioButtonGroup = useFormResult.formContext.fields[defaultRadioButtonGroupProps.name] as RadioButtonGroup;
			const initialFields = JSON.parse(JSON.stringify(radioButtonGroup.fields));

			act(() => {
				sut.register(dummyRadioButtonData);
			});

			expect(initialFields).toEqual({});
			expect(radioButtonGroup.fields).toMatchObject({ [dummyRadioButtonData.value]: dummyRadioButtonData });
		});

		it('should not call radioButtonGroup.addField if the field is already present.', () => {
			const addFieldSpy = jest.spyOn(RadioButtonGroup.prototype, 'addField');
			act(() => {
				sut.register(dummyRadioButtonData);
				sut.register(dummyRadioButtonData);
			});

			expect(addFieldSpy).toHaveBeenCalledTimes(1);
		});

		it('should return an IradioButtonReturnProps object', () => {
			let result;

			act(() => {
				result = sut.register(dummyRadioButtonData);
			});

			expect(result).toEqual(
				expect.objectContaining({
					id: expect.any(String),
					name: expect.any(String),
					value: expect.any(String),
					defaultChecked: expect.any(Boolean),
					type: expect.any(String),
					ref: expect.any(Function),
				})
			);
		});

		it('should add an additional onChange method to the returned value if useForm is called with validateOnChange set to true', () => {
			renderHook(() => {
				useFormResult = useForm({ validateOnChange: true });
				sut = useRadioButtonGroup(defaultRadioButtonGroupProps, useFormResult.formContext);
			});
			let result;

			act(() => {
				result = sut.register(dummyRadioButtonData);
			});

			expect(result).toEqual(
				expect.objectContaining({ onChange: expect.any(Function) })
			);
		});
	});

	describe('validateRadioButtonGroup', () => {
		it('should create an empty object reference of the radio button group in the formContext\'s errors ref.', () => {
			const initialValue = useFormResult.formContext.formErrorsRef.current[defaultRadioButtonGroupProps.name] ?? undefined;

			act(() => {
				sut.validateRadioButtonGroup(false);
			});
			const currentValue = useFormResult.formContext.formErrorsRef.current[defaultRadioButtonGroupProps.name];

			expect(initialValue).toEqual(undefined);
			expect(currentValue).toEqual({});
		});

		it('should call the radioButtonGroup\'s validate method', () => {
			const validateSpy = jest.spyOn(RadioButtonGroup.prototype, 'validate');
			act(() => {
				sut.validateRadioButtonGroup(false);
			});

			expect(validateSpy).toHaveBeenCalledTimes(1);
		});

		it('should store the radioButtonGroup\'s errors getter result as the value to its formContext\'s errors registration field.', () => {
			const expectedError = { dummyErrorKey: 'dummyErrorValue' };
			const errorGetterSpy = jest.spyOn(RadioButtonGroup.prototype, 'errors', 'get').mockReturnValue(expectedError);

			act(() => {
				sut.validateRadioButtonGroup(false);
			});

			expect(errorGetterSpy).toHaveBeenCalledTimes(1);
			expect(useFormResult.formContext.formErrorsRef.current[defaultRadioButtonGroupProps.name]).toEqual(expectedError);
		});

		it('should call the formContext\'s refreshFormState method if called with shouldRefreshFormState set to true', () => {
			const refreshFormStateSpy = jest.fn();
			renderHook(() => {
				useFormResult = useForm();
				sut = useRadioButtonGroup(defaultRadioButtonGroupProps, { ...useFormResult.formContext, refreshFormState: refreshFormStateSpy });
			});

			act(() => {
				sut.register(dummyRadioButtonData);
				sut.validateRadioButtonGroup(true);
			});

			expect(refreshFormStateSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('registerRadioButton (ref callback)', () => {
		it('should update the provided field\'s ref.current value with the provided ref', () => {
			const checkboxGroup = useFormResult.formContext.fields[defaultRadioButtonGroupProps.name] as RadioButtonGroup;
			let initialFieldValue: IRadioButton;

			act(() => {
				const registerResults = sut.register(dummyRadioButtonData);
				initialFieldValue = JSON.parse(JSON.stringify(checkboxGroup.fields[dummyRadioButtonData.value]));
				mount(<input {...registerResults} />);
			});

			expect(initialFieldValue.ref.current).toEqual(null);
			expect(checkboxGroup.fields[dummyRadioButtonData.value].ref.current).not.toEqual(null);
		});
	});

	describe('unregisterRadioButton (ref callback)', () => {
		it('should remove the provided field from the radioButtonGroup\'s field list', () => {
			const radioButtonGroup = useFormResult.formContext.fields[defaultRadioButtonGroupProps.name] as RadioButtonGroup;
			let initialFieldValue: { [key: string]: IRadioButton };
			let wrapper: ReactWrapper;

			act(() => {
				const registerResults = sut.register(dummyRadioButtonData);
				wrapper = mount(<input {...registerResults} />);
				initialFieldValue = JSON.parse(JSON.stringify(radioButtonGroup.fields[dummyRadioButtonData.value]?.id));
				wrapper.unmount();
			});

			expect(initialFieldValue).not.toEqual(undefined);
			expect(radioButtonGroup.fields[dummyRadioButtonData.value]?.id).toEqual(undefined);
		});
	});
});
