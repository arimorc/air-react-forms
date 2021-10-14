import { Checkbox } from '../../../src/types/checkbox';
import { CheckboxGroup } from '../../../src/types/checkboxGroup';
import { hasMaxChecked } from '../../../src/validators';

describe('hasMaxChecked validator', () => {
	const errorMessage = 'dummy error message';

	let checkboxGroup: CheckboxGroup;
	const defaultCheckboxGroupProps = {
		id: 'dummy_field_array',
		name: 'dummy_field_array',
		type: 'checkbox',
		defaultValue: '',
	};

	const fakeInputOne = { value: 'dummy_value', checked: true } as HTMLInputElement;
	const fakeInputTwo = { value: 'dummy_value', checked: true } as HTMLInputElement;

	beforeEach(() => {
		checkboxGroup = new CheckboxGroup(defaultCheckboxGroupProps);
		checkboxGroup.addField(new Checkbox({ id: '1', value: '1', name: defaultCheckboxGroupProps.name, checked: true, ref: { current: fakeInputOne }, type: 'checkbox' }));
		checkboxGroup.addField(new Checkbox({ id: '2', value: '2', name: defaultCheckboxGroupProps.name, checked: true, ref: { current: fakeInputTwo }, type: 'checkbox' }));
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('should return undefined if the provided checkboxGroup has no field', () => {
		checkboxGroup = new CheckboxGroup(defaultCheckboxGroupProps);
		const maxCheckedAmount = 1;

		expect(hasMaxChecked(maxCheckedAmount, errorMessage)(checkboxGroup)).toEqual(undefined);
	});

	it('should return the provided message if there are more checked checkboxes than allowed by the provided criteria.', () => {
		const maxCheckedAmount = 1;

		expect(hasMaxChecked(maxCheckedAmount, errorMessage)(checkboxGroup)).toEqual(errorMessage);
	});

	it('should return undefined if the amount of checked checkboxes is lesser than the provided criteria.', () => {
		const maxCheckedAmount = 2;
		Object.values(checkboxGroup.fields)[0].checked = false;

		expect(hasMaxChecked(maxCheckedAmount, errorMessage)(checkboxGroup)).toEqual(undefined);
	});

	it('should return undefined if the amount of checked checkboxes is equal to the provided criteria.', () => {
		const maxCheckedAmount = 2;

		expect(hasMaxChecked(maxCheckedAmount, errorMessage)(checkboxGroup)).toEqual(undefined);
	});
});
