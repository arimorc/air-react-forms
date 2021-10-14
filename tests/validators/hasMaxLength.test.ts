import { hasMaxLength } from '../../src/validators';

describe('hasMaxLength', () => {
	const errorMessage = 'dummy_error_message';
	const maxLength = 8;

	it('should return the provided error message if the value is undefined', () => {
		expect(hasMaxLength(maxLength, errorMessage)(undefined)).toEqual(errorMessage);
	});

	it('should return the provided message if the value has more length than the provided criteria.', () => {
		const value = 'this value is way too long !';

		expect(hasMaxLength(maxLength, errorMessage)(value)).toEqual(errorMessage);
	});

	it('should return undefined if the value has a length equal or lesser than the provided criteria.', () => {
		const value = 'sorry';

		expect(hasMaxLength(maxLength, errorMessage)(value)).toEqual(undefined);
	});

	it('should ignore outer whitespaces.', () => {
		const value = '        alright        ';

		expect(hasMaxLength(maxLength, errorMessage)(value)).toEqual(undefined);
	});
});
