import { isRequired } from '../../src/validators';

describe('isRequired', () => {
	it('should return the provided message if the value is an empty string.', () => {
		const errorMessage = 'Are you shy, or something ?';
		const value = '';

		expect(isRequired(errorMessage)(value)).toEqual(errorMessage);
	});

	it('should return the provided message if the value is null or undefined.', () => {
		const errorMessage = 'Are you shy, or something ?';
		const value = undefined;

		expect(isRequired(errorMessage)(value)).toEqual(errorMessage);
	});

	it('should return an empty string if the value is truthy.', () => {
		const errorMessage = 'Are you shy, or something ?';
		const value = 'I just waited for my turn to talk.';

		expect(isRequired(errorMessage)(value)).toEqual('');
	});

	it('should return a default \'required\' error message if non is provided.', () => {
		const errorMessage = 'required';
		const value = '';

		expect(isRequired()(value)).toEqual(errorMessage);
	});

	it('should ignore outer whitespaces.', () => {
		const errorMessage = 'Are you shy, or something ?';
		const value = '                ';

		expect(isRequired(errorMessage)(value)).toEqual(errorMessage);
	});
});
