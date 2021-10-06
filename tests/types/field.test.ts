import React from 'react';
import { Field } from '../../src/types/field';
import { FieldElement, FormElement } from '../../src/types/formElement';

describe('Field class', () => {
	let sut: Field;

	const fakeFieldElement = { value: 'abcd' } as FieldElement;

	const defaultFieldCreationParams = {
		id: 'dummy_field',
		name: 'dummy_field',
		rules: {},
		ref: { current: fakeFieldElement },
		type: 'text',
		defaultValue: '',
	};

	beforeEach(() => {
		sut = new Field(defaultFieldCreationParams);
	});

	describe('Type assertion', () => {
		it('should extend the FormElement abstract class.', () => {
			expect(sut instanceof FormElement).toEqual(true);
		});
	});

	describe('constructor', () => {
		it('should call react.createRef<FieldElement> if no ref is provided', () => {
			const createRefSpy = jest.spyOn(React, 'createRef');
			sut = new Field({ ...defaultFieldCreationParams, ref: undefined });
			expect(createRefSpy).toHaveBeenCalledTimes(1);
		});

		it('should set the type field to "text" if no type is provided', () => {
			sut = new Field({ ...defaultFieldCreationParams, type: undefined });
			expect(sut.type).toEqual('text');
		});

		it('should set the defaultValue field to an empty string if no default value is provided', () => {
			sut = new Field({ ...defaultFieldCreationParams, defaultValue: undefined });
			expect(sut.defaultValue).toEqual('');
		});
	});

	describe('get value', () => {
		it('should return the registered ref\'s current value field\'s value.', () => {
			expect(sut.value).toEqual(fakeFieldElement.value);
		});

		it('should return undefined if no reference has been registered yet.', () => {
			sut.ref = undefined;
			expect(sut.value).toEqual(undefined);
		});
	});

	describe('validate', () => {
		beforeEach(() => {
			sut = new Field({
				...defaultFieldCreationParams,
				rules: {
					error: (value) => ((value as string).trim().length === 0 ? 'error' : ''),
				},
			});
		});

		it('should update the field\'s errors field with name: undefined key value pair for each passed validation rule.', () => {
			sut.validate();
			expect(sut.errors).toEqual({
				error: undefined,
			});
		});

		it('should update the field\'s errors field with name: string key value pair for each failed validation rule.', () => {
			sut.ref.current.value = '';
			sut.validate();
			expect(sut.errors).toEqual({
				error: 'error',
			});
		});

		it('should not update the errors field if no ref is registered', () => {
			sut.ref = undefined;
			sut.validate();
			expect(sut.errors).toEqual({});
		});
	});

	describe('focus', () => {
		it('should focus the field\'s HTMLElement ref', () => {
			sut.ref.current.focus = jest.fn();
			sut.focus();
			expect(sut.ref.current.focus).toHaveBeenCalledTimes(1);
		});
	});
});
