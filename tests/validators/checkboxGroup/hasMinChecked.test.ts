import { Checkbox } from '../../../src/types/checkbox';
import { CheckboxGroup } from '../../../src/types/checkboxGroup';
import { hasMinChecked } from '../../../src/validators';

describe('hasMinChecked validator', () => {
	const errorMessage = 'dummy error message';

	let checkboxGroup: CheckboxGroup;
	const defaultCheckboxGroupProps = {
		id: 'dummy_field_array',
		name: 'dummy_field_array',
		type: 'checkbox',
		defaultValue: '',
	};

	const fakeInputOne = { value: 'dummy_value', checked: false } as HTMLInputElement;
	const fakeInputTwo = { value: 'dummy_value', checked: false } as HTMLInputElement;

	beforeEach(() => {
		checkboxGroup = new CheckboxGroup(defaultCheckboxGroupProps);
		checkboxGroup.addField(new Checkbox({ id: '1', value: '1', name: defaultCheckboxGroupProps.name, checked: true, ref: { current: fakeInputOne }, type: 'checkbox' }));
		checkboxGroup.addField(new Checkbox({ id: '2', value: '2', name: defaultCheckboxGroupProps.name, checked: true, ref: { current: fakeInputTwo }, type: 'checkbox' }));
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('should return the errorMessage if the provided checkboxGroup has no field', () => {
		checkboxGroup = new CheckboxGroup(defaultCheckboxGroupProps);
		const maxCheckedAmount = 1;

		expect(hasMinChecked(maxCheckedAmount, errorMessage)(checkboxGroup)).toEqual(errorMessage);
	});

	it('should return the provided message if there are less checked checkboxes than allowed by the provided criteria.', () => {
		const maxCheckedAmount = 1;

		expect(hasMinChecked(maxCheckedAmount, errorMessage)(checkboxGroup)).toEqual(errorMessage);
	});

	it('should return undefined if the amount of checked checkboxes is greater than the provided criteria.', () => {
		const maxCheckedAmount = 1;
		Object.values(checkboxGroup.fields)[0].checked = true;

		expect(hasMinChecked(maxCheckedAmount, errorMessage)(checkboxGroup)).toEqual(undefined);
	});

	it('should return undefined if the amount of checked checkboxes is equal to the provided criteria.', () => {
		const maxCheckedAmount = 1;
		Object.values(checkboxGroup.fields)[0].checked = true;

		expect(hasMinChecked(maxCheckedAmount, errorMessage)(checkboxGroup)).toEqual(undefined);
	});
});
