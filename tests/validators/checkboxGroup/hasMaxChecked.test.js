import { hasMaxChecked } from '../../../src/validators';
import logger from '../../../src/utils/logger';

describe.skip('hasMaxChecked', () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

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

	it('should call logger.warn if called with no checkboxes', () => {
		const loggerWarnSpy = jest.spyOn(logger, 'warn').mockImplementation(jest.fn());

		hasMaxChecked(2, '')({});
		expect(loggerWarnSpy).toHaveBeenCalledTimes(1);
	});

	it('should call logger.warn if called with less checkboxes than the required maxCheckedAmount value', () => {
		const loggerWarnSpy = jest.spyOn(logger, 'warn').mockImplementation(jest.fn());
		const systemUnderValidation = {
			isCheckboxGroup: true,
			name: 'dummy_cbx_group',
			rules: {},
			'cbx-one': { ref: { checked: true } },
			'cbx-two': { ref: { checked: false } },
		};

		hasMaxChecked(3, '')(systemUnderValidation);
		expect(loggerWarnSpy).toHaveBeenCalledTimes(1);
	});
});
