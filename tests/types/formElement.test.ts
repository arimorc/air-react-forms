/* eslint-disable require-jsdoc */
import { FieldValue, FormElement } from '../../src/types/formElement';

class FormElementSpec extends FormElement {
	get value(): FieldValue | undefined { return undefined || this.id; }
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	validate = (): void => {};
}

describe('FormElement class', () => {
	let sut: FormElementSpec;
	const rules = {
		error: (value: FieldValue) => ((value as string).trim().length === 0 ? 'error' : ''),
	};

	const defaultConstructorParams = {
		id: 'dummy_field',
		name: 'dummy_field',
		rules: {},
		errors: {},
	};

	describe('constructor', () => {
		it('should set the rules field to an empty object if no rule is provided', () => {
			sut = new FormElementSpec({ ...defaultConstructorParams, rules: undefined });
			expect(sut.rules).toEqual({});
		});

		it('should set the errors field to a key-value pair mapping of the rules field if no error is provided', () => {
			sut = new FormElementSpec({ ...defaultConstructorParams, rules, errors: undefined });
			expect(sut.errors).toEqual({
				error: undefined,
			});
		});
	});

	describe('get errors', () => {
		it('should return the content of the private _errors field', () => {
			sut = new FormElementSpec({ ...defaultConstructorParams, errors: { dummyErrorKey: 'dummyErrorValue' } });
			expect(sut.errors).toEqual({ dummyErrorKey: 'dummyErrorValue' });
		});
	});

	describe('isValid', () => {
		it('should return true if the formElement has no rules', () => {
			sut = new FormElementSpec({ ...defaultConstructorParams, rules: undefined });
			expect(sut.isValid()).toEqual(true);
		});

		it('should return true if the all errors have an undefined value', () => {
			sut = new FormElementSpec({ ...defaultConstructorParams, errors: { errorOne: undefined, errorTwo: undefined } });
			expect(sut.isValid()).toEqual(true);
		});

		it('should return false if at least one error has a non-undefined value', () => {
			sut = new FormElementSpec({
				...defaultConstructorParams,
				rules: {
					errorOne: (value: FieldValue) => ((value as string).trim().length === 0 ? 'error one' : ''),
					errorTwo: (value: FieldValue) => ((value as string).trim().length === 0 ? 'error two' : ''),
				},
				errors: { errorOne: 'true', errorTwo: undefined },
			});
			expect(sut.isValid()).toEqual(false);
		});
	});
});
