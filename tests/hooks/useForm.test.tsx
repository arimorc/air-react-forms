import React from 'react';
import { mount } from 'enzyme';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderHook from '../testUtils/renderHook';
import { useForm } from '../../src';
import { Field } from '../../src/types/field';
import { FormData, IUseFormReturn } from '../../src/types/form';
import { FormElement } from '../../src/types/formElement';

describe('useFormHook', () => {
	let sut: IUseFormReturn;
	const isRequiredValidator = jest.fn().mockImplementation((value) => (value.trim().length === 0 ? 'required' : ''));

	beforeEach(() => {
		renderHook(() => {
			sut = useForm();
		});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('fields', () => {
		it('should be an object containing registered fields as Field instances', () => {
			const fieldsData = {
				firstname: { id: 'firstname', name: 'firstname', rules: {}, type: 'text' },
				lastname: { id: 'lastname', name: 'lastname', rules: {}, type: 'text' },
			};

			mount(
				<div>
					<input {...sut.register(fieldsData.firstname)} />
					<input {...sut.register(fieldsData.lastname)} />
				</div>
			);
			const { formContext: { fields } } = sut;
			expect(fields).toEqual(
				expect.objectContaining({
					firstname: expect.any(Field),
					lastname: expect.any(Field),
				})
			);
		});
	});

	describe('formState', () => {
		it('should be initialized with an empty errors object field', () => {
			expect(sut.formState).toEqual({ errors: {} });
		});

		it('should contain an error field for each registered field', () => {
			renderHook(() => { sut = useForm({ validateOnChange: true }); });

			const fieldData = { id: 'firstname', name: 'firstname', rules: {}, type: 'text', defaultValue: 'john' };
			render(<input data-testid="firstname" {...sut.register(fieldData)} />);

			act(() => {
				userEvent.type(screen.getByTestId('firstname'), 'test');
			});

			expect(sut.formState).toEqual({
				errors: expect.objectContaining({
					[fieldData.name]: expect.anything(),
				}),
			});
		});
	});

	describe('register', () => {
		it('should add a new Field object to the fields object', () => {
			const fieldData = { id: 'firstname', name: 'firstname', rules: {}, type: 'text' };
			const initialFields = JSON.parse(JSON.stringify({ ...sut.formContext.fields }));

			mount(<input {...sut.register(fieldData)} />);

			const { formContext: { fields: updatedFields } } = sut;

			expect(initialFields).toEqual({});
			expect(updatedFields).toMatchObject({ firstname: expect.any(Field) });
		});

		it('should add a new entry to the formErrorsRef object', () => {
			const fieldData = { id: 'firstname', name: 'firstname', rules: {}, type: 'text' };
			const initialFormErrorsRef = JSON.parse(JSON.stringify({ ...sut.formContext.formErrorsRef.current }));

			mount(<input {...sut.register(fieldData)} />);

			expect(initialFormErrorsRef).toEqual({});
			expect(sut.formContext.formErrorsRef.current).toMatchObject({ firstname: undefined });
		});

		it('should return an IFieldReturnProps object', () => {
			const fieldData = { id: 'firstname', name: 'firstname', rules: {}, type: 'text', defaultValue: 'john' };

			const result = sut.register(fieldData);

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
			renderHook(() => { sut = useForm({ validateOnChange: true }); });
			const fieldData = { id: 'firstname', name: 'firstname', rules: {}, type: 'text', defaultValue: 'john' };

			const result = sut.register(fieldData);

			expect(result).toEqual(
				expect.objectContaining({ onChange: expect.any(Function) })
			);
		});
	});

	describe('handleSubmit', () => {
		const dummyFormSubmitEvent = {} as React.FormEvent;

		beforeEach(() => {
			dummyFormSubmitEvent.preventDefault = jest.fn();
		});

		it('should prevent the default form submission event', () => {
			// eslint-disable-next-line require-jsdoc
			const dummyCallback = (formData: FormData) => jest.fn(() => formData);

			sut.handleSubmit(dummyCallback)(dummyFormSubmitEvent);

			expect(dummyFormSubmitEvent.preventDefault).toHaveBeenCalledTimes(1);
		});

		it('should call the provided callback method if the form is valid', () => {
			const callbackSpec = { dummyCallback: (formData: FormData) => jest.fn(() => formData) };
			const callbackSpy = jest.spyOn(callbackSpec, 'dummyCallback');

			sut.handleSubmit(callbackSpec.dummyCallback)(dummyFormSubmitEvent);

			expect(callbackSpy).toHaveBeenCalled();
		});

		it('should not call the provided callback method if the form is valid', () => {
			const fieldData = { id: 'firstname', name: 'firstname', rules: { required: isRequiredValidator }, type: 'text' };
			const callbackMock = jest.fn();

			render(<input {...sut.register(fieldData)} />);

			act(() => {
				sut.handleSubmit(callbackMock)(dummyFormSubmitEvent);
			});

			expect(callbackMock).not.toHaveBeenCalled();
		});
	});

	describe('validateField', () => {
		it('should return if the provided field is not registered', () => {
			const fieldData = { id: 'firstname', name: 'firstname', rules: {}, type: 'text' };
			const unknownField = new Field(fieldData);
			const validateSpy = jest.spyOn(unknownField, 'validate');

			sut.formContext.validateField(false)(unknownField);

			expect(validateSpy).not.toHaveBeenCalled();
		});

		it('should call the provided field\'s validate method if it has been registered', () => {
			const fieldData = { id: 'firstname', name: 'firstname', rules: {}, type: 'text' };
			sut.register(fieldData);
			const field = sut.formContext.fields[fieldData.name] as Field;
			const validateSpy = jest.spyOn(field, 'validate');

			sut.formContext.validateField(false)(field);

			expect(validateSpy).toHaveBeenCalled();
		});

		it('should update the formErrorsRef field with the updated field\'s errors', () => {
			const initialFormErrorsRefValue = JSON.parse(JSON.stringify(sut.formContext.formErrorsRef.current));
			const fieldData = { id: 'firstname', name: 'firstname', rules: { required: isRequiredValidator }, type: 'text' };

			render(<input {...sut.register(fieldData)} />);

			sut.formContext.validateField(false)(sut.formContext.fields[fieldData.name] as Field);
			const currentFormErrorsRefValue = sut.formContext.formErrorsRef.current;

			expect(initialFormErrorsRefValue).not.toEqual(currentFormErrorsRefValue);
			expect(currentFormErrorsRefValue).toEqual({
				[fieldData.name]: {
					required: 'required',
				},
			});
		});

		it('should update the formState\'s errors field if called with shouldRefreshFormState set to true', () => {
			const initialFormState = JSON.parse(JSON.stringify(sut.formState));
			const fieldData = { id: 'firstname', name: 'firstname', rules: { required: isRequiredValidator }, type: 'text' };

			render(<input {...sut.register(fieldData)} />);

			act(() => {
				sut.formContext.validateField(true)(sut.formContext.fields[fieldData.name] as Field);
			});

			expect(sut.formState).not.toEqual(initialFormState);
			expect(sut.formState).toEqual({
				errors: {
					[fieldData.name]: { required: 'required' },
				},
			});
		});
	});

	describe('getFormValues', () => {
		it('should return values of all registered fields bundled into a single object', () => {
			const fieldsData = [
				{ id: 'firstname', name: 'firstname', rules: {}, type: 'text', defaultValue: 'john' },
				{ id: 'lastname', name: 'lastname', rules: {}, type: 'text', defaultValue: 'doe' },
				{ id: 'age', name: 'age', rules: {}, type: 'number', defaultValue: '35' },
			];

			mount(
				<>
					{fieldsData.map((field) => <input key={field.id} {...sut.register(field)} />)}
				</>
			);

			const expectedResult = {
				firstname: 'john',
				lastname: 'doe',
				age: '35',
			};

			expect(sut.formContext.getFormValues()).toEqual(expectedResult);
		});

		it('should return an empty object if no field has been registered', () => {
			expect(sut.formContext.getFormValues()).toEqual({});
		});
	});

	describe('isFormValid', () => {
		it('should call the isValid method of each registered formElement.', () => {
			const fieldData = { id: 'firstname', name: 'firstname', rules: {}, type: 'text' };
			render(<input {...sut.register(fieldData)} />);
			const field: FormElement = sut.formContext.fields[fieldData.name];
			const isValidSpy = jest.spyOn(field, 'isValid');

			sut.formContext.isFormValid();

			expect(isValidSpy).toHaveBeenCalled();
		});

		it('should return true if all registered fields\' isValid calls return true.', () => {
			const fieldData = { id: 'firstname', name: 'firstname', rules: {}, type: 'text' };
			render(<input {...sut.register(fieldData)} />);
			const field: FormElement = sut.formContext.fields[fieldData.name];
			jest.spyOn(field, 'isValid').mockReturnValue(true);

			expect(sut.formContext.isFormValid()).toEqual(true);
		});

		it('should return false if at least one registered field\'s isValid calls returns false.', () => {
			const fieldData = { id: 'firstname', name: 'firstname', rules: {}, type: 'text' };
			render(<input {...sut.register(fieldData)} />);
			const field: FormElement = sut.formContext.fields[fieldData.name];
			jest.spyOn(field, 'isValid').mockReturnValue(false);

			expect(sut.formContext.isFormValid()).toEqual(false);
		});
	});

	describe('refreshFormState', () => {
		it('should update the formState to match the latest value of formErrorsRef', () => {
			sut.formContext.formErrorsRef.current = { dummyField: { dummyError: undefined } };
			const initialFormStateValue = JSON.parse(JSON.stringify(sut.formState));

			act(() => {
				sut.formContext.refreshFormState();
			});

			expect(sut.formState).not.toEqual(initialFormStateValue);
			expect(sut.formState).toEqual({
				errors: sut.formContext.formErrorsRef.current,
			});
		});
	});
});
