import React from 'react';
import { RadioButton, IRadioButtonReturnProps } from '../../src/types/radioButton';

describe('RadioButton class', () => {
	let sut: RadioButton;

	const fakeInput = { value: 'dummy_value', checked: false } as HTMLInputElement;

	const defaultRadioButtonProps = {
		id: 'dummy_field',
		name: 'dummy_field',
		value: fakeInput.value,
		checked: fakeInput.checked,
		defaultChecked: fakeInput.checked,
		ref: { current: fakeInput },
		type: 'radio',
	};

	beforeEach(() => {
		sut = new RadioButton(defaultRadioButtonProps);
	});

	describe('constructor', () => {
		it('should call react.createRef<FieldElement> if no ref is provided', () => {
			const createRefSpy = jest.spyOn(React, 'createRef');
			sut = new RadioButton({ ...defaultRadioButtonProps, ref: undefined });
			expect(createRefSpy).toHaveBeenCalledTimes(1);
		});

		it('should set the type field to radio', () => {
			sut = new RadioButton({ ...defaultRadioButtonProps, type: 'text' });
			expect(sut.type).toEqual('radio');
		});

		it('should set the defaultChecked field to a false if no defaultChecked is provided', () => {
			sut = new RadioButton({ ...defaultRadioButtonProps, defaultChecked: undefined });
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
			sut = new RadioButton({ ...defaultRadioButtonProps, ref: undefined });
			expect(sut.checked).toEqual(false);
			sut.checked = true;
			expect(sut.checked).toEqual(false);
		});
	});

	describe('extractRadioButtonProps', () => {
		it('should return expected values', () => {
			const expectedResult: IRadioButtonReturnProps = {
				id: defaultRadioButtonProps.id,
				name: defaultRadioButtonProps.name,
				type: defaultRadioButtonProps.type,
				defaultChecked: defaultRadioButtonProps.defaultChecked,
				value: defaultRadioButtonProps.value,
				ref: undefined,
			};

			expect(RadioButton.extractRadioButtonProps(sut)).toEqual(expectedResult);
		});
	});
});
