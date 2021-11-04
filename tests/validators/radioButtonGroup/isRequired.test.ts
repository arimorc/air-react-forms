import { rdbGroupIsRequired } from '../../../src/validators';
import { RadioButton } from '../../../src/types/radioButton';
import { RadioButtonGroup } from '../../../src/types/radioButtonGroup';

describe('Radio button isRequired validator', () => {
	const errorMessage = 'dummy error message';

	let radioButtonGroup: RadioButtonGroup;
	const defaultRadioButtonGroupProps = {
		id: 'dummy_field_array',
		name: 'dummy_field_array',
		type: 'radio',
		defaultValue: '',
	};

	const fakeInputOne = { value: 'dummy_value', checked: false } as HTMLInputElement;
	const fakeInputTwo = { value: 'dummy_value', checked: false } as HTMLInputElement;

	beforeEach(() => {
		radioButtonGroup = new RadioButtonGroup(defaultRadioButtonGroupProps);
		radioButtonGroup.addField(new RadioButton({ id: '1', value: '1', name: defaultRadioButtonGroupProps.name, checked: false, ref: { current: fakeInputOne }, type: 'radio' }));
		radioButtonGroup.addField(new RadioButton({ id: '2', value: '2', name: defaultRadioButtonGroupProps.name, checked: false, ref: { current: fakeInputTwo }, type: 'radio' }));
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('should return the errorMessage if the provided radioButtonGroup has no field', () => {
		expect(rdbGroupIsRequired(errorMessage)(radioButtonGroup)).toEqual(errorMessage);
	});

	it('should return the provided message if no input is checked.', () => {
		expect(rdbGroupIsRequired(errorMessage)(radioButtonGroup)).toEqual(errorMessage);
	});

	it('should return undefined if one of the inputs is checked.', () => {
		Object.values(radioButtonGroup.fields)[0].checked = true;
		expect(rdbGroupIsRequired(errorMessage)(radioButtonGroup)).toEqual(undefined);
	});
});
