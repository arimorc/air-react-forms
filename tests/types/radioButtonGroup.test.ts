import { act } from 'react-dom/test-utils';
import { RadioButton } from '../../src/types/radioButton';
import { RadioButtonGroup } from '../../src/types/radioButtonGroup';
import { FormElement } from '../../src/types/formElement';

describe('RadioButtonGroup class', () => {
	let sut: RadioButtonGroup;

	const fakeInput = { value: 'dummy_value', checked: false } as HTMLInputElement;

	const defaultRadioButtonGroupProps = {
		id: 'dummy_field_array',
		name: 'dummy_field_array',
		rules: {},
		type: 'radio',
		defaultValue: '',
	};

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
		sut = new RadioButtonGroup(defaultRadioButtonGroupProps);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('Type assertion', () => {
		it('should extend the FormElement abstract class.', () => {
			expect(sut instanceof FormElement).toEqual(true);
		});
	});

	describe('constructor', () => {
		it('should set the defaultValue field to undefined if no defaultValue is provided', () => {
			sut = new RadioButtonGroup({ ...defaultRadioButtonGroupProps, defaultValue: undefined });
			expect(sut.defaultValue).toEqual(undefined);
		});
	});

	describe('get value', () => {
		it('should return the value of its checked children field value.', () => {
			const field = new RadioButton(defaultRadioButtonProps);
			const childrenGetValueSpy = jest.spyOn(field, 'checked', 'get').mockReturnValue(true);
			const expectedResult = field.value;

			sut.addField(field);
			const result = sut.value;

			expect(result).toEqual(expectedResult);
			expect(childrenGetValueSpy).toHaveBeenCalledTimes(1);
		});

		it('should return undefined if no children is present', () => {
			expect(sut.value).toEqual(undefined);
		});
	});

	describe('set value', () => {
		const fakeInputOne = { value: 'dummy_value_one', checked: true } as HTMLInputElement;
		const fakeInputTwo = { value: 'dummy_value_two', checked: false } as HTMLInputElement;

		beforeEach(() => {
			sut = new RadioButtonGroup(defaultRadioButtonGroupProps);
			sut.addField(new RadioButton({
				id: 'dummy_field',
				name: 'dummy_field',
				value: fakeInputOne.value,
				checked: fakeInputOne.checked,
				defaultChecked: fakeInputOne.checked,
				ref: { current: fakeInputOne },
				type: 'radio',
			}));
			sut.addField(new RadioButton({
				id: 'dummy_field',
				name: 'dummy_field',
				value: fakeInputTwo.value,
				checked: fakeInputTwo.checked,
				defaultChecked: fakeInputTwo.checked,
				ref: { current: fakeInputTwo },
				type: 'radio',
			}));
		});

		it('should not update any field if the provided value is not registered', () => {
			expect(sut.fields.dummy_value_one.checked).toEqual(true);
			expect(sut.fields.dummy_value_two.checked).toEqual(false);

			act(() => {
				sut.value = 'unregistered_value';
			});

			expect(sut.fields.dummy_value_one.checked).toEqual(true);
			expect(sut.fields.dummy_value_two.checked).toEqual(false);
		});

		it('should set the linked value to checked, and the others\' to false.', () => {
			expect(sut.fields.dummy_value_one.checked).toEqual(true);
			expect(sut.fields.dummy_value_two.checked).toEqual(false);

			act(() => {
				sut.value = fakeInputTwo.value;
			});

			expect(sut.fields.dummy_value_one.checked).toEqual(false);
			expect(sut.fields.dummy_value_two.checked).toEqual(true);
		});
	});

	describe('validate', () => {
		let dummyValidator: jest.Mock;

		beforeEach(() => {
			dummyValidator = jest.fn().mockReturnValue(undefined);
			sut = new RadioButtonGroup({
				...defaultRadioButtonGroupProps,
				rules: { required: dummyValidator },
			});
		});

		afterEach(() => {
			jest.restoreAllMocks();
		});

		describe('Scenario : no radio button registered.', () => {
			it('should not call any validator.', () => {
				sut.validate();
				expect(dummyValidator).not.toHaveBeenCalled();
			});

			it('should not update the errors field.', () => {
				const initialValue = sut.errors;
				sut.validate();
				expect(sut.errors).toEqual(initialValue);
			});
		});

		describe('Scenario : at least one radio button registered.', () => {
			it('should call each registered validator', () => {
				act(() => {
					sut.addField(new RadioButton(defaultRadioButtonProps));
					sut.validate();
				});

				expect(dummyValidator).toHaveBeenCalledTimes(1);
			});

			it('should update the radioButtonGroup\'s errors field with name: undefined key value pair for each passed validation rule.', () => {
				act(() => {
					sut.addField(new RadioButton(defaultRadioButtonProps));
					sut.validate();
				});

				expect(sut.errors).toEqual({ required: undefined });
			});

			it('should update the field\'s errors field with name: string key value pair for each failed validation rule.', () => {
				dummyValidator.mockReturnValue('Error message');
				act(() => {
					sut.addField(new RadioButton(defaultRadioButtonProps));
					sut.validate();
				});

				expect(sut.errors).toEqual({ required: 'Error message' });
			});
		});
	});
});
