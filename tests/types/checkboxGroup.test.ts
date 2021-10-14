import { act } from 'react-dom/test-utils';
import { Checkbox } from '../../src/types/checkbox';
import { CheckboxGroup } from '../../src/types/checkboxGroup';
import { FormElement } from '../../src/types/formElement';

describe('FieldArray class', () => {
	let sut: CheckboxGroup;

	const fakeInput = { value: 'dummy_value', checked: false } as HTMLInputElement;

	const defaultCheckboxGroupProps = {
		id: 'dummy_field_array',
		name: 'dummy_field_array',
		rules: {},
		type: 'checkbox',
		defaultValue: '',
	};

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
		sut = new CheckboxGroup(defaultCheckboxGroupProps);
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
		it('should set the defaultValue field to false if no defaultValue is provided', () => {
			sut = new CheckboxGroup({ ...defaultCheckboxGroupProps, defaultValue: undefined });
			expect(sut.defaultValue).toEqual(false);
		});
	});

	describe('get value', () => {
		it('should return the result of its children fields\' value get accessor call as a bundle.', () => {
			const field = new Checkbox(defaultCheckboxProps);
			const childrenGetValueSpy = jest.spyOn(field, 'checked', 'get').mockReturnValue(true);
			const expectedResult = { [field.value]: true };

			sut.addField(field);
			const result = sut.value;

			expect(result).toEqual(expectedResult);
			expect(childrenGetValueSpy).toHaveBeenCalledTimes(1);
		});

		it('should return an empty object if no children is present', () => {
			expect(sut.value).toEqual({});
		});
	});

	describe('validate', () => {
		let dummyValidator: jest.Mock;

		beforeEach(() => {
			dummyValidator = jest.fn().mockReturnValue(undefined);
			sut = new CheckboxGroup({
				...defaultCheckboxGroupProps,
				rules: { minChecked: dummyValidator },
			});
		});

		afterEach(() => {
			jest.restoreAllMocks();
		});

		describe('Scenario : no checkbox registered.', () => {
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

		describe('Scenario : at least one checkbox registered.', () => {
			it('should call each registered validator', () => {
				act(() => {
					sut.addField(new Checkbox(defaultCheckboxProps));
					sut.validate();
				});

				expect(dummyValidator).toHaveBeenCalledTimes(1);
			});

			it('should update the checkboxGroup\'s errors field with name: undefined key value pair for each passed validation rule.', () => {
				act(() => {
					sut.addField(new Checkbox(defaultCheckboxProps));
					sut.validate();
				});

				expect(sut.errors).toEqual({ minChecked: undefined });
			});

			it('should update the field\'s errors field with name: string key value pair for each failed validation rule.', () => {
				dummyValidator.mockReturnValue('Error message');
				act(() => {
					sut.addField(new Checkbox(defaultCheckboxProps));
					sut.validate();
				});

				expect(sut.errors).toEqual({ minChecked: 'Error message' });
			});
		});
	});
});
