import React from 'react';
import { mount } from 'enzyme';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderHook from '../testUtils/renderHook';
import { useForm } from '../../src';
import { Field } from '../../src/types/field';
import { FormData, UseFormReturnType } from '../../src/types/useForm';

describe('useFormHook', () => {
	let sut: UseFormReturnType;

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

		it('should return a FieldProps object', () => {
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
		it('should prevent the default form submission event', () => {
			const event = {} as React.FormEvent;
			event.preventDefault = jest.fn();
			/**
			 *
			 */
			const dummyCallback = (formData: FormData) => jest.fn(() => formData);
			sut.handleSubmit(dummyCallback)(event);

			expect(event.preventDefault).toHaveBeenCalledTimes(1);
		});
	});
});
