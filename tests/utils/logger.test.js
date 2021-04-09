import logger from '../../src/utils/logger';

describe('logger utility methods', () => {
	const initialEnvironmentMode = process.env.NODE_ENV;

	beforeEach(() => {
		global.console = {
			error: jest.fn(),
			warn: jest.fn(),
		};
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('warn method', () => {
		afterAll(() => {
			if (initialEnvironmentMode) {
				process.env.NODE_ENV = initialEnvironmentMode;
			} else {
				delete process.env.NODE_ENV;
			}
		});

		it('should not project any console message while in production mode', () => {
			process.env.NODE_ENV = 'production';
			logger.warn('warning message');

			expect(global.console.warn).toHaveBeenCalledTimes(0);
		});

		it('should project a console warn message with defined prefix while in non-production mode', () => {
			process.env.NODE_ENV = 'dev';
			logger.warn('warning message');

			expect(global.console.warn).toHaveBeenNthCalledWith(1, '%s : %s', logger.PREFIX, 'warning message');
		});
	});

	describe('error method mode', () => {
		afterAll(() => {
			if (initialEnvironmentMode) {
				process.env.NODE_ENV = initialEnvironmentMode;
			} else {
				delete process.env.NODE_ENV;
			}
		});
		it('should not project any console message while in production mode', () => {
			process.env.NODE_ENV = 'production';
			logger.error('error message');

			expect(global.console.error).toHaveBeenCalledTimes(0);
		});

		it('should project a console error message with defined prefix while in non-production mode', () => {
			process.env.NODE_ENV = 'dev';
			logger.error('error message');

			expect(global.console.error).toHaveBeenNthCalledWith(1, '%s : %s', logger.PREFIX, 'error message');
		});
	});
});
