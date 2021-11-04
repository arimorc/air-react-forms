import React from 'react';
import { Field } from '../../src/types/field';
import { Fieldset } from '../../src/types/fieldset';
import { FieldValue, FieldElement, FormElement } from '../../src/types/formElement';
import { ValidationRules } from '../../src/types/validation';

describe('Fieldset class', () => {
	let sut: Fieldset;

	const fakeFieldElement = { value: 'abcd' } as FieldElement;

	const defaultFieldsetCreationParams = {
		id: 'dummy_fieldset',
		name: 'dummy_fieldset',
		rules: {},
	};

	const defaultFieldCreationParams = {
		id: 'dummy_field',
		name: 'dummy_field',
		rules: {},
		ref: { current: fakeFieldElement },
		type: 'text',
		defaultValue: '',
	};

	beforeEach(() => {
		sut = new Fieldset(defaultFieldsetCreationParams);
	});

	describe('Type assertion', () => {
		it('should extend the FormElement abstract class.', () => {
			expect(sut instanceof FormElement).toEqual(true);
		});
	});

	describe('get value', () => {
		it('should return the result of its children fields\' value get accessor call as a bundle.', () => {
			const field = new Field(defaultFieldCreationParams);
			const childrenGetValueSpy = jest.spyOn(field, 'value', 'get').mockReturnValue('dummy value');
			const expectedResult = { [field.name]: 'dummy value' };

			sut.registerField(field);
			const result = sut.value;

			expect(result).toEqual(expectedResult);
			expect(childrenGetValueSpy).toHaveBeenCalledTimes(1);
		});

		it('should return an empty object if no children is present', () => {
			expect(sut.value).toEqual({});
		});
	});

	describe('get errors', () => {
		it('should return the result of its children fields\' errors get accessor call as a bundle.', () => {
			const field = new Field(defaultFieldCreationParams);
			const childrenGetErrorSpy = jest.spyOn(field, 'errors', 'get').mockReturnValue({ dummyErrorKey: 'dummy error value' });
			const expectedResult = { [field.name]: { dummyErrorKey: 'dummy error value' } };

			sut.registerField(field);
			const result = sut.errors;

			expect(result).toEqual(expectedResult);
			expect(childrenGetErrorSpy).toHaveBeenCalledTimes(1);
		});

		it('should return an empty object if no children is present', () => {
			expect(sut.errors).toEqual({});
		});
	});

	describe('validate', () => {
		it('should call the validate method of each of its children', () => {
			const field = new Field(defaultFieldCreationParams);
			const childrenValidateSpy = jest.spyOn(field, 'validate').mockImplementation(jest.fn());

			sut.registerField(field);
			sut.validate();

			expect(childrenValidateSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('isValid', () => {
		const dummyRules: ValidationRules = {
			error: (value: FieldValue) => ((value as string).trim().length === 0 ? 'error' : undefined),
		};

		it('should return true if the fieldset has no rules', () => {
			expect(sut.isValid()).toEqual(true);
		});

		it('should return true if all of its children\'s isValid method return true', () => {
			sut = new Fieldset({ ...defaultFieldsetCreationParams, rules: dummyRules });
			const field = new Field(defaultFieldCreationParams);
			jest.spyOn(Field.prototype, 'isValid').mockReturnValue(true);
			sut.registerField(field);

			expect(sut.isValid()).toEqual(true);
		});

		it('should return false if at least of its children\'s isValid method returns false', () => {
			sut = new Fieldset({ ...defaultFieldsetCreationParams, rules: dummyRules });
			const fieldOne = new Field({ ...defaultFieldCreationParams, id: 'dummy_field_one', name: 'dummy_field_one', rules: dummyRules });
			const fieldTwo = new Field({ ...defaultFieldCreationParams, id: 'dummy_field_two', name: 'dummy_field_two', rules: dummyRules });

			jest.spyOn(Field.prototype, 'isValid').mockReturnValue(true).mockReturnValueOnce(false);

			sut.registerField(fieldOne);
			sut.registerField(fieldTwo);

			expect(sut.isValid()).toEqual(false);
		});
	});

	describe('registerField', () => {
		it('should add the provided field to the fieldset\'s field list if it doesn\'t contain it yet', () => {
			const initialFieldList = JSON.parse(JSON.stringify(sut.fields));
			const field = new Field(defaultFieldCreationParams);
			sut.registerField(field);

			expect(initialFieldList).toEqual({});
			expect(sut.fields).toEqual({ [field.name]: field });
		});

		it('should update the existing field with the provided one inside the fieldset\'s field list.', () => {
			const field = new Field(defaultFieldCreationParams);
			sut.registerField(field);
			const initialFieldList = JSON.parse(JSON.stringify(sut.fields));

			const updatedField = new Field({ ...defaultFieldCreationParams, errors: { error: 'one' } });
			sut.registerField(updatedField);

			expect(initialFieldList).toEqual(JSON.parse(JSON.stringify({ [field.name]: field })));
			expect(sut.fields).toEqual({ [field.name]: updatedField });
		});
	});
});
