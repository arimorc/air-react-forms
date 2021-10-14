import React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { act } from 'react-dom/test-utils';
import renderHook from '../testUtils/renderHook';
import { useCheckboxGroup, useForm } from '../../src';
import { CheckboxGroup, IUseCheckboxGroupProps, IUseCheckboxGroupReturn } from '../../src/types/checkboxGroup';
import { IUseFormReturn } from '../../src/types/form';
import { ICheckbox, ICheckboxProps } from '../../src/types/checkbox';

describe('UseCheckboxGroup hook', () => {
	let useFormResult: IUseFormReturn;
	let sut: IUseCheckboxGroupReturn;

	const defaultCheckboxGroupProps: IUseCheckboxGroupProps = {
		id: 'system-under-test',
		name: 'system-under-test',
		type: 'checkbox',
		rules: {},
	};

	const dummyCheckboxData: ICheckboxProps = {
		id: `${defaultCheckboxGroupProps.name}-0`,
		name: `${defaultCheckboxGroupProps.name}`,
		value: 'value-0',
		type: 'checkbox',
		defaultChecked: false,
		checked: false,
	};

	beforeEach(() => {
		renderHook(() => {
			useFormResult = useForm();
			sut = useCheckboxGroup(defaultCheckboxGroupProps, useFormResult.formContext);
		});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('register', () => {
		it('should add a new Checkbox object to the checkboxGroup\'s fields field if it is not already present', () => {
			const checkboxGroup = useFormResult.formContext.fields[defaultCheckboxGroupProps.name] as CheckboxGroup;
			const initialFields = JSON.parse(JSON.stringify(checkboxGroup.fields));

			act(() => {
				sut.register(dummyCheckboxData);
			});

			expect(initialFields).toEqual({});
			expect(checkboxGroup.fields).toMatchObject({ [dummyCheckboxData.value]: dummyCheckboxData });
		});

		it('should not call checkboxGroup.addField if the field is already present.', () => {
			const addFieldSpy = jest.spyOn(CheckboxGroup.prototype, 'addField');
			act(() => {
				sut.register(dummyCheckboxData);
				sut.register(dummyCheckboxData);
			});

			expect(addFieldSpy).toHaveBeenCalledTimes(1);
		});

		it('should return an ICheckboxReturnProps object', () => {
			let result;

			act(() => {
				result = sut.register(dummyCheckboxData);
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
				sut = useCheckboxGroup(defaultCheckboxGroupProps, useFormResult.formContext);
			});
			let result;

			act(() => {
				result = sut.register(dummyCheckboxData);
			});

			expect(result).toEqual(
				expect.objectContaining({ onChange: expect.any(Function) })
			);
		});
	});

	describe('validateCheckboxGroup', () => {
		it('should create an empty object reference of the checkbox group in the formContext\'s errors ref.', () => {
			const initialValue = useFormResult.formContext.formErrorsRef.current[defaultCheckboxGroupProps.name] ?? undefined;

			act(() => {
				sut.validateCheckboxGroup(false);
			});
			const currentValue = useFormResult.formContext.formErrorsRef.current[defaultCheckboxGroupProps.name];

			expect(initialValue).toEqual(undefined);
			expect(currentValue).toEqual({});
		});

		it('should call the checkboxGroup\'s validate method', () => {
			const validateSpy = jest.spyOn(CheckboxGroup.prototype, 'validate');
			act(() => {
				sut.validateCheckboxGroup(false);
			});

			expect(validateSpy).toHaveBeenCalledTimes(1);
		});

		it('should store the checkboxGroup\'s errors getter result as the value to its formContext\'s errors registration field.', () => {
			const expectedError = { dummyErrorKey: 'dummyErrorValue' };
			const errorGetterSpy = jest.spyOn(CheckboxGroup.prototype, 'errors', 'get').mockReturnValue(expectedError);

			act(() => {
				sut.validateCheckboxGroup(false);
			});

			expect(errorGetterSpy).toHaveBeenCalledTimes(1);
			expect(useFormResult.formContext.formErrorsRef.current[defaultCheckboxGroupProps.name]).toEqual(expectedError);
		});

		it('should call the formContext\'s refreshFormState method if called with shouldRefreshFormState set to true', () => {
			const refreshFormStateSpy = jest.fn();
			renderHook(() => {
				useFormResult = useForm();
				sut = useCheckboxGroup(defaultCheckboxGroupProps, { ...useFormResult.formContext, refreshFormState: refreshFormStateSpy });
			});

			act(() => {
				sut.register(dummyCheckboxData);
				sut.validateCheckboxGroup(true);
			});

			expect(refreshFormStateSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('registerCheckbox (ref callback)', () => {
		it('should update the provided field\'s ref.current value with the provided ref', () => {
			const checkboxGroup = useFormResult.formContext.fields[defaultCheckboxGroupProps.name] as CheckboxGroup;
			let initialFieldValue: ICheckbox;

			act(() => {
				const registerResults = sut.register(dummyCheckboxData);
				initialFieldValue = JSON.parse(JSON.stringify(checkboxGroup.fields[dummyCheckboxData.value]));
				mount(<input {...registerResults} />);
			});

			expect(initialFieldValue.ref.current).toEqual(null);
			expect(checkboxGroup.fields[dummyCheckboxData.value].ref.current).not.toEqual(null);
		});
	});

	describe('unregisterCheckbox (ref callback)', () => {
		it('should remove the provided field from the checkboxGroup\'s field list', () => {
			const checkboxGroup = useFormResult.formContext.fields[defaultCheckboxGroupProps.name] as CheckboxGroup;
			let initialFieldValue: { [key: string]: ICheckbox };
			let wrapper: ReactWrapper;

			act(() => {
				const registerResults = sut.register(dummyCheckboxData);
				wrapper = mount(<input {...registerResults} />);
				initialFieldValue = JSON.parse(JSON.stringify(checkboxGroup.fields[dummyCheckboxData.value]?.id));
				wrapper.unmount();
			});

			expect(initialFieldValue).not.toEqual(undefined);
			expect(checkboxGroup.fields[dummyCheckboxData.value]?.id).toEqual(undefined);
		});
	});
});
