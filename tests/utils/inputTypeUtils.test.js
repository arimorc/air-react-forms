import {
	isCheckbox,
	isRadio,
	isRadioOrCheckbox,
	getDefaultValueByInputType,
	isSelect,
} from '../../src/utils/inputTypeUtils';

describe('input type utils', () => {
	describe('isCheckbox', () => {
		it('shoud return true if provided with a checkbox typed element', () => {
			expect(isCheckbox({ type: 'checkbox' })).toEqual(true);
		});

		it('shoud return false if provided with a non checkbox typed element', () => {
			expect(isCheckbox({ type: 'number' })).toEqual(false);
		});

		it('shoud return false if provided with an element without type', () => {
			expect(isCheckbox({})).toEqual(false);
		});
	});

	describe('isRadio', () => {
		it('shoud return true if provided with a radio typed element', () => {
			expect(isRadio({ type: 'radio' })).toEqual(true);
		});

		it('shoud return false if provided with a non radio typed element', () => {
			expect(isRadio({ type: 'number' })).toEqual(false);
		});

		it('shoud return false if provided with an element without type', () => {
			expect(isRadio({})).toEqual(false);
		});
	});

	describe('isRadioOrCheckbox', () => {
		it('shoud return true if provided with a checkbox typed element', () => {
			expect(isRadioOrCheckbox({ type: 'radio' })).toEqual(true);
		});

		it('shoud return true if provided with a radio typed element', () => {
			expect(isRadioOrCheckbox({ type: 'radio' })).toEqual(true);
		});

		it('shoud return false if provided with a non radio nor checkbox typed element', () => {
			expect(isRadioOrCheckbox({ type: 'number' })).toEqual(false);
		});

		it('shoud return false if provided with an element without type', () => {
			expect(isRadioOrCheckbox({})).toEqual(false);
		});
	});

	describe('isSelect', () => {
		it('should return true if provided with a select-one element', () => {
			expect(isSelect({ type: 'select-one' })).toEqual(true);
		});

		it('should return true if provided with a select-multiple element', () => {
			expect(isSelect({ type: 'select-multiple' })).toEqual(true);
		});

		it('should return false if provided with a non-select element', () => {
			expect(isSelect({ type: 'checkbox' })).toEqual(false);
		});

		it('should return false if provided with an element without a type', () => {
			expect(isSelect({})).toEqual(false);
		});
	});

	describe('getDefaultValueByInputType', () => {
		it('should return an empty string if called with a \'text\' input type', () => {
			expect(getDefaultValueByInputType('text')).toStrictEqual('');
		});

		it('should return an empty string if called with an \'email\' input type', () => {
			expect(getDefaultValueByInputType('email')).toStrictEqual('');
		});

		it('should return an empty string if called with a \'tel\' input type', () => {
			expect(getDefaultValueByInputType('tel')).toStrictEqual('');
		});

		it('should return 0 if called with a \'number\' input type', () => {
			expect(getDefaultValueByInputType('number')).toStrictEqual(0);
		});

		it('should return \'#FFFFFF\' if called with a \'color\' input type', () => {
			expect(getDefaultValueByInputType('color')).toStrictEqual('#FFFFFF');
		});

		it('should return null if called with another type than the ones listed previously.', () => {
			expect(getDefaultValueByInputType('unreferenced-input-type')).toBeNull();
		});
	});
});
