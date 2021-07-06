import testHook from '../testUtils/hookTestUtils';
import logger from '../../src/utils/logger';
import { useForm, useCheckboxGroup } from '../../src';

describe('useCheckboxGroup hook', () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('hook call result', () => {
		it('should return multiple methods and attributes when called', () => {
			let useFormResults;
			let sut;

			testHook(() => {
				useFormResults = useForm();
				sut = useCheckboxGroup({ name: 'checkboxGroup', rules: {} }, useFormResults.formContext);
			});

			const expectedValues = {
				fields: expect.any(Array),
				register: expect.any(Function),
				errors: {},
			};

			expect(sut).toMatchObject(expectedValues);
		});
	});

	describe('form context provision check', () => {
		jest.mock('react', () => {
			const ActualReact = require.requireActual('react');

			return { ...ActualReact, useContext: () => undefined };
		});

		it('should call logger.fatal if no context is provided to the hook', () => {
			const initialNodeEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = 'test';

			const loggerFatalSpy = jest.spyOn(logger, 'fatal');

			testHook(() => {
				expect(() => useCheckboxGroup({ name: 'checkboxGroup' }, undefined)).toThrowError();
			});

			expect(loggerFatalSpy).toHaveBeenCalledTimes(1);

			process.env.NODE_ENV = initialNodeEnv;
		});
	});

	// @TODO: test if defaultValues properly sets checkboxes to "checked"
	// @TODO: test if the registerCheckbox method adds a new ref to the refList
	// @TODO: test if the unregisterCheckbox method removed the ref from the reflist
	// @TODO: test if the register method creates a checkbox group reference in the form's ref list if none exists
	// @TODO: test the register method's behavior on first call
	// @TODO: test the register method's behavior on subsequent calls
	// @TODO: test the register method's defaultChecked argument provision if none is provided.
	// @TODO: test if the provided validation rules are triggered on the checkbox group.
});
