import { hasMinLength } from '../../src/validators';

describe('hasMinLength', () => {
	it('should return the provided message if the value has less length than the provided criteria.', () => {
		const errorMessage = 'you better elaborate, son.';
		const minLength = 8;
		const value = 'ok';

		expect(hasMinLength(minLength, errorMessage)(value)).toEqual(errorMessage);
	});

	it('should return an empty string if the value has a length equal or greater than the provided criteria.', () => {
		const errorMessage = 'you better elaborate, son.';
		const minLength = 8;
		const value = 'sorry, sir. I\'ll do my best.';

		expect(hasMinLength(minLength, errorMessage)(value)).toEqual('');
	});

	it('should ignore outer whitespaces.', () => {
		const errorMessage = 'you better elaborate, son.';
		const minLength = 8;
		const value = '        alright        ';

		expect(hasMinLength(minLength, errorMessage)(value)).toEqual(errorMessage);
	});
});
