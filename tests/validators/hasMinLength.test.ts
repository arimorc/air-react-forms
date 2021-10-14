import { hasMinLength } from '../../src/validators';

describe('hasMinLength', () => {
	const errorMessage = 'dummy_error_message';
	const minLength = 8;

	it('should return the provided error message if the value is undefined', () => {
		expect(hasMinLength(minLength, errorMessage)(undefined)).toEqual(errorMessage);
	});

	it('should return the provided message if the value has less length than the provided criteria.', () => {
		const value = 'ok';

		expect(hasMinLength(minLength, errorMessage)(value)).toEqual(errorMessage);
	});

	it('should return undefined if the value has a length equal or greater than the provided criteria.', () => {
		const value = 'sorry, sir. I\'ll do my best.';

		expect(hasMinLength(minLength, errorMessage)(value)).toEqual(undefined);
	});

	it('should ignore outer whitespaces.', () => {
		const value = '        alright        ';

		expect(hasMinLength(minLength, errorMessage)(value)).toEqual(errorMessage);
	});
});
