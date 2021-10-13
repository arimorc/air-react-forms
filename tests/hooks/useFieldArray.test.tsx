import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import renderHook from '../testUtils/renderHook';
import { useFieldArray, useForm } from '../../src';
import { FieldArray, IUseFieldArrayReturn } from '../../src/types/fieldArray';
import { IUseFormReturn } from '../../src/types/form';
import { Field, IField } from '../../src/types/field';

describe('useFieldArray Hook', () => {
	let useFormResult: IUseFormReturn;
	let sut: IUseFieldArrayReturn;

	const defaultFieldArrayProps = {
		id: 'system-under-test',
		name: 'system-under-test',
		type: 'text',
		defaultValue: '',
		rules: {},
		errors: {},
	};

	const dummyNewFieldData = {
		id: `${defaultFieldArrayProps.name}-field-0`,
		name: `${defaultFieldArrayProps.name}-field-0`,
		rules: defaultFieldArrayProps.rules,
		defaultValue: defaultFieldArrayProps.defaultValue,
		type: defaultFieldArrayProps.type,
	};

	beforeEach(() => {
		renderHook(() => {
			useFormResult = useForm();
			sut = useFieldArray(defaultFieldArrayProps, useFormResult.formContext);
		});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('fields', () => {
		it('should mirror the fieldArray\'s "field" field\'s value', () => {
			act(() => {
				sut.append();
				sut.append();
			});

			const fieldArray = useFormResult.formContext.fields[defaultFieldArrayProps.name] as FieldArray;
			expect(sut.fields).toEqual(fieldArray.fields);
		});
	});

	describe('register', () => {
		it('should add a new Field object to the fieldArray\'s fields field if it is not already present', () => {
			const fieldArray = useFormResult.formContext.fields[defaultFieldArrayProps.name] as FieldArray;
			const initialFields = JSON.parse(JSON.stringify(fieldArray.fields));

			act(() => {
				sut.register(dummyNewFieldData);
			});

			expect(initialFields).toEqual({});
			expect(fieldArray.fields).toMatchObject({ [dummyNewFieldData.name]: dummyNewFieldData });
		});

		it('should not call fieldArray.addField if the field is already present.', () => {
			const addFieldSpy = jest.spyOn(FieldArray.prototype, 'addField');
			act(() => {
				sut.register(dummyNewFieldData);
				sut.register(dummyNewFieldData);
			});

			expect(addFieldSpy).toHaveBeenCalledTimes(1);
		});

		it('should return an IFieldReturnProps object', () => {
			let result;

			act(() => {
				result = sut.register(dummyNewFieldData);
			});

			expect(result).toEqual(
				expect.objectContaining({
					id: expect.any(String),
					name: expect.any(String),
					rules: expect.any(Object),
					type: expect.any(String),
					defaultValue: expect.any(String),
					ref: expect.any(Function),
				})
			);
		});

		it('should add an additional onChange method to the returned value if useForm is called with validateOnChange set to true', () => {
			renderHook(() => {
				useFormResult = useForm({ validateOnChange: true });
				sut = useFieldArray(defaultFieldArrayProps, useFormResult.formContext);
			});
			let result;

			act(() => {
				result = sut.register(dummyNewFieldData);
			});

			expect(result).toEqual(
				expect.objectContaining({ onChange: expect.any(Function) })
			);
		});
	});

	describe('remove', () => {
		it('should remove the passed field from the fieldarray\'s list of registered fields', () => {
			const fieldArray = useFormResult.formContext.fields[defaultFieldArrayProps.name] as FieldArray;
			let initialFields;

			act(() => {
				sut.register(dummyNewFieldData);
				initialFields = JSON.parse(JSON.stringify(fieldArray.fields));
				sut.remove(fieldArray.fields[dummyNewFieldData.name]);
			});

			expect(initialFields).toEqual({ [dummyNewFieldData.name]: expect.objectContaining(dummyNewFieldData) });
			expect(fieldArray.fields).toEqual({});
		});
	});

	describe('validateField', () => {
		it('should not call the field\'s validate method if it is not registered in the formContext.', () => {
			const validateSpy = jest.spyOn(Field.prototype, 'validate');
			const field = new Field(dummyNewFieldData);

			sut.validateField(false)(field);
			expect(validateSpy).not.toHaveBeenCalled();
		});

		it('should register the fieldArray\'s error with an empty object if it is not registered yet.', () => {
			const initialErrors = JSON.parse(JSON.stringify(useFormResult.formContext.formErrorsRef.current));
			const fieldArray = useFormResult.formContext.fields[defaultFieldArrayProps.name] as FieldArray;

			act(() => {
				sut.register(dummyNewFieldData);
				sut.validateField(false)(fieldArray.fields[dummyNewFieldData.name]);
			});

			const actualErrors = JSON.parse(JSON.stringify(useFormResult.formContext.formErrorsRef.current));

			expect(initialErrors).toEqual({});
			expect(actualErrors).toEqual({ [defaultFieldArrayProps.name]: expect.any(Object) });
		});

		it('should call the provided field\'s validate method', () => {
			const validateSpy = jest.spyOn(Field.prototype, 'validate');
			const fieldArray = useFormResult.formContext.fields[defaultFieldArrayProps.name] as FieldArray;

			act(() => {
				sut.register(dummyNewFieldData);
				sut.validateField(false)(fieldArray.fields[dummyNewFieldData.name]);
			});

			expect(validateSpy).toHaveBeenCalledTimes(1);
		});

		it('should update the formContext\'s formErrorsRef value with the result of the field\'s errors accessor.', () => {
			const expectedError = { dummyErrorKey: 'dummyErrorValue' };
			jest.spyOn(Field.prototype, 'errors', 'get').mockReturnValue(expectedError);
			const fieldArray = useFormResult.formContext.fields[defaultFieldArrayProps.name] as FieldArray;

			act(() => {
				sut.register(dummyNewFieldData);
				sut.validateField(false)(fieldArray.fields[dummyNewFieldData.name]);
			});

			expect(useFormResult.formContext.formErrorsRef.current).toEqual({
				[defaultFieldArrayProps.name]: {
					[dummyNewFieldData.name]: expectedError,
				},
			});
		});

		it('should call the useForm\'s refreshFormState method if called with shouldRefreshFormState set to true', () => {
			const refreshFormStateSpy = jest.fn();
			renderHook(() => {
				useFormResult = useForm();
				sut = useFieldArray(defaultFieldArrayProps, { ...useFormResult.formContext, refreshFormState: refreshFormStateSpy });
			});

			const fieldArray = useFormResult.formContext.fields[defaultFieldArrayProps.name] as FieldArray;

			act(() => {
				sut.register(dummyNewFieldData);
				sut.validateField(true)(fieldArray.fields[dummyNewFieldData.name]);
			});

			expect(refreshFormStateSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('registerField (ref callback)', () => {
		it('should update the provided field\'s ref.current value with the provided ref', () => {
			const fieldArray = useFormResult.formContext.fields[defaultFieldArrayProps.name] as FieldArray;
			let initialFieldValue: IField;

			act(() => {
				const registerResults = sut.register(dummyNewFieldData);
				initialFieldValue = JSON.parse(JSON.stringify(fieldArray.fields[dummyNewFieldData.name]));
				mount(<input {...registerResults} />);
			});

			expect(initialFieldValue.ref.current).toEqual(null);
			expect(fieldArray.fields[dummyNewFieldData.name].ref.current).not.toEqual(null);
		});
	});
});
