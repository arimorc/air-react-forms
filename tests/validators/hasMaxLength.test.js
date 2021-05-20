import { hasMaxLength } from '../../src/validators';

describe('hasMaxLength', () => {
	it('should return the provided message if the value has more length than the provided criteria.', () => {
		const errorMessage = 'keep it short, sweaty.';
		const maxLength = 8;
		const value = 'this value is way too long !';

		expect(hasMaxLength(maxLength, errorMessage)(value)).toEqual(errorMessage);
	});

	it('should return an empty string if the value has a length equal or lesser than the provided criteria.', () => {
		const errorMessage = 'keep it short, sweaty.';
		const maxLength = 8;
		const value = 'sorry';

		expect(hasMaxLength(maxLength, errorMessage)(value)).toEqual('');
	});

	it('should ignore outer whitespaces.', () => {
		const errorMessage = 'keep it short, sweaty.';
		const maxLength = 8;
		const value = '        alright        ';

		expect(hasMaxLength(maxLength, errorMessage)(value)).toEqual('');
	});
});
