import { hasMinChecked } from '../../../src/validators';
import logger from '../../../src/utils/logger';

describe.skip('hasMinChecked', () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('should return the provided message if there are less checked checkboxes than required by the provided criteria.', () => {
		const errorMessage = 'That\'s just lack of motivation.';
		const minCheckedAmount = 2;

		const systemUnderValidation = {
			isCheckboxGroup: true,
			name: 'dummy_cbx_group',
			rules: {},
			'cbx-one': { ref: { checked: true } },
			'cbx-two': { ref: { checked: false } },
			'cbx-three': { ref: { checked: false } },
		};

		expect(hasMinChecked(minCheckedAmount, errorMessage)(systemUnderValidation)).toEqual(errorMessage);
	});

	it('should return an empty string if the amount of checked checkboxes is greater than the provided criteria.', () => {
		const errorMessage = 'That\'s just lack of motivation.';
		const minCheckedAmount = 2;

		const systemUnderValidation = {
			isCheckboxGroup: true,
			name: 'dummy_cbx_group',
			rules: {},
			'cbx-one': { ref: { checked: true } },
			'cbx-two': { ref: { checked: true } },
			'cbx-three': { ref: { checked: true } },
		};

		expect(hasMinChecked(minCheckedAmount, errorMessage)(systemUnderValidation)).toEqual('');
	});

	it('should return an empty string if the amount of checked checkboxes is equal to the provided criteria.', () => {
		const errorMessage = 'That\'s just lack of motivation.';
		const minCheckedAmount = 2;

		const systemUnderValidation = {
			isCheckboxGroup: true,
			name: 'dummy_cbx_group',
			rules: {},
			'cbx-one': { ref: { checked: true } },
			'cbx-two': { ref: { checked: false } },
			'cbx-three': { ref: { checked: true } },
		};

		expect(hasMinChecked(minCheckedAmount, errorMessage)(systemUnderValidation)).toEqual('');
	});

	it('should call logger.warn if called with no checkboxes', () => {
		const loggerWarnSpy = jest.spyOn(logger, 'warn').mockImplementation(jest.fn());

		hasMinChecked(2, '')({});
		expect(loggerWarnSpy).toHaveBeenCalledTimes(1);
	});

	it('should call logger.warn if called with less checkboxes than the required minCheckedAmount value', () => {
		const loggerWarnSpy = jest.spyOn(logger, 'warn').mockImplementation(jest.fn());
		const systemUnderValidation = {
			isCheckboxGroup: true,
			name: 'dummy_cbx_group',
			rules: {},
			'cbx-one': { ref: { checked: true } },
			'cbx-two': { ref: { checked: false } },
		};

		hasMinChecked(3, '')(systemUnderValidation);
		expect(loggerWarnSpy).toHaveBeenCalledTimes(1);
	});
});
