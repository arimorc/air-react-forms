import React from 'react';
import { Checkbox, ICheckboxReturnProps } from '../../src/types/checkbox';

describe('Checkbox class', () => {
	let sut: Checkbox;

	const fakeInput = { value: 'dummy_value', checked: false } as HTMLInputElement;

	const defaultCheckboxProps = {
		id: 'dummy_field',
		name: 'dummy_field',
		value: fakeInput.value,
		checked: fakeInput.checked,
		defaultChecked: fakeInput.checked,
		ref: { current: fakeInput },
		type: 'checkbox',
	};

	beforeEach(() => {
		sut = new Checkbox(defaultCheckboxProps);
	});

	describe('constructor', () => {
		it('should call react.createRef<FieldElement> if no ref is provided', () => {
			const createRefSpy = jest.spyOn(React, 'createRef');
			sut = new Checkbox({ ...defaultCheckboxProps, ref: undefined });
			expect(createRefSpy).toHaveBeenCalledTimes(1);
		});

		it('should set the type field to checkbox if no type is provided', () => {
			sut = new Checkbox({ ...defaultCheckboxProps, type: undefined });
			expect(sut.type).toEqual('checkbox');
		});

		it('should set the defaultChecked field to a false if no defaultChecked is provided', () => {
			sut = new Checkbox({ ...defaultCheckboxProps, defaultChecked: undefined });
			expect(sut.defaultChecked).toEqual(false);
		});
	});

	describe('get checked', () => {
		it('should return the registered ref\'s current checked field\'s value.', () => {
			expect(sut.checked).toEqual(fakeInput.checked);
		});

		it('should return false if no reference has been registered yet.', () => {
			sut.ref = undefined;
			expect(sut.checked).toEqual(false);
		});
	});

	describe('set checked', () => {
		it('should set the field\'s ref\'s current checked to the one provided.', () => {
			const initialValue = fakeInput.checked;
			sut.checked = !fakeInput.checked;
			expect(sut.checked).not.toEqual(initialValue);
			expect(sut.ref?.current?.checked).toEqual(sut.checked);
		});

		it('should not update the field\'s ref\'s current checked if its ref field is undefined.', () => {
			sut = new Checkbox({ ...defaultCheckboxProps, ref: undefined });
			expect(sut.checked).toEqual(false);
			sut.checked = true;
			expect(sut.checked).toEqual(false);
		});
	});

	describe('extractCheckboxProps', () => {
		it('should return expected values', () => {
			const expectedResult: ICheckboxReturnProps = {
				id: defaultCheckboxProps.id,
				name: defaultCheckboxProps.name,
				type: defaultCheckboxProps.type,
				defaultChecked: defaultCheckboxProps.defaultChecked,
				value: defaultCheckboxProps.value,
				ref: undefined,
			};

			expect(Checkbox.extractCheckboxProps(sut)).toEqual(expectedResult);
		});
	});
});
