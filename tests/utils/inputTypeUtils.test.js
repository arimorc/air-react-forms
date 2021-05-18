import {
	isCheckbox,
	isRadio,
	isRadioOrCheckbox,
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
});
