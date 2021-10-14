import { isRequired } from '../../src/validators';

describe('isRequired', () => {
	const errorMessage = 'dummy_error_message';

	it('should return the provided error message if the value is undefined', () => {
		expect(isRequired(errorMessage)(undefined)).toEqual(errorMessage);
	});

	it('should return the provided message if the value is an empty string.', () => {
		const value = '';

		expect(isRequired(errorMessage)(value)).toEqual(errorMessage);
	});

	it('should return the provided message if the value is null or undefined.', () => {
		const value = undefined;

		expect(isRequired(errorMessage)(value)).toEqual(errorMessage);
	});

	it('should return undefined if the value is truthy.', () => {
		const value = 'I just waited for my turn to talk.';

		expect(isRequired(errorMessage)(value)).toEqual(undefined);
	});

	it('should return a default \'required\' error message if none is provided.', () => {
		const value = '';

		expect(isRequired()(value)).toEqual('required');
	});

	it('should ignore outer whitespaces.', () => {
		const value = '                ';

		expect(isRequired(errorMessage)(value)).toEqual(errorMessage);
	});
});
