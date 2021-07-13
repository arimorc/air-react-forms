import { rdbGroupIsRequired } from '../../../src/validators';
import logger from '../../../src/utils/logger';

describe('rdbGroupIsRequired', () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('should return the provided message if no input is checked.', () => {
		const errorMessage = 'Please pick one of the options';

		const systemUnderValidation = {
			isRadioButtonGroup: true,
			name: 'dummy_rdb_group',
			'rdb-one': { ref: { checked: false } },
			'rdb-two': { ref: { checked: false } },
			'rdb-three': { ref: { checked: false } },
		};

		expect(rdbGroupIsRequired(errorMessage)(systemUnderValidation)).toEqual(errorMessage);
	});

	it('should return an empty string if one of the inputs is checked.', () => {
		const errorMessage = 'Please pick one of the options';

		const systemUnderValidation = {
			isRadioButtonGroup: true,
			name: 'dummy_rdb_group',
			'rdb-one': { ref: { checked: false } },
			'rdb-two': { ref: { checked: true } },
			'rdb-three': { ref: { checked: false } },
		};
		expect(rdbGroupIsRequired(errorMessage)(systemUnderValidation)).toEqual('');
	});

	it('should call logger.warn if called with no radio button', () => {
		const loggerWarnSpy = jest.spyOn(logger, 'warn').mockImplementation(jest.fn());

		rdbGroupIsRequired('')({});
		expect(loggerWarnSpy).toHaveBeenCalledTimes(1);
	});
});
