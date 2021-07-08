import { hasMaxChecked } from '../../src/validators';

describe('hasMaxChecked', () => {
	it('should return the provided message if there are more checked checkboxes than allowed by the provided criteria.', () => {
		const errorMessage = 'Easy there, champ.';
		const maxCheckedAmount = 2;

		const systemUnderValidation = {
			isCheckboxGroup: true,
			name: 'dummy_cbx_group',
			rules: {},
			'cbx-one': { ref: { checked: true } },
			'cbx-two': { ref: { checked: true } },
			'cbx-three': { ref: { checked: true } },
		};

		expect(hasMaxChecked(maxCheckedAmount, errorMessage)(systemUnderValidation)).toEqual(errorMessage);
	});

	it('should return an empty string if the amount of checked checkboxes is lesser than the provided criteria.', () => {
		const errorMessage = 'Easy there, champ.';
		const maxCheckedAmount = 2;

		const systemUnderValidation = {
			isCheckboxGroup: true,
			name: 'dummy_cbx_group',
			rules: {},
			'cbx-one': { ref: { checked: true } },
			'cbx-two': { ref: { checked: false } },
			'cbx-three': { ref: { checked: false } },
		};

		expect(hasMaxChecked(maxCheckedAmount, errorMessage)(systemUnderValidation)).toEqual('');
	});

	it('should return an empty string if the amount of checked checkboxes is equal to the provided criteria.', () => {
		const errorMessage = 'Easy there, champ.';
		const maxCheckedAmount = 2;

		const systemUnderValidation = {
			isCheckboxGroup: true,
			name: 'dummy_cbx_group',
			rules: {},
			'cbx-one': { ref: { checked: true } },
			'cbx-two': { ref: { checked: false } },
			'cbx-three': { ref: { checked: true } },
		};

		expect(hasMaxChecked(maxCheckedAmount, errorMessage)(systemUnderValidation)).toEqual('');
	});
});
