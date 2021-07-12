import { act, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { useForm, useRadioButtonGroup } from '../../src';
import logger from '../../src/utils/logger';
import testHook from '../testUtils/hookTestUtils';
import RadioButtonGroupTestForm from '../testUtils/RadioButtonGroupTestForm';

describe('useRadioButtonGroup hook', () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('hook call result', () => {
		it('should return multiple methods and attributes when called.', () => {
			let useFormResults;
			let sut;

			testHook(() => {
				useFormResults = useForm();
				sut = useRadioButtonGroup({ name: 'radioButtonGroup', rules: {} }, useFormResults.formContext);
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

		it('should call logger.fatal if not context is provided to the hook.', () => {
			const initialNodeEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = 'test';

			const loggerFatalSpy = jest.spyOn(logger, 'fatal');

			testHook(() => {
				expect(() => useRadioButtonGroup({ name: 'radioButtonGroup' }, undefined)).toThrowError();
			});

			expect(loggerFatalSpy).toHaveBeenCalledTimes(1);

			process.env.NODE_ENV = initialNodeEnv;
		});
	});

	describe('default value provision', () => {
		it('should not check any radio button if no default value string is provided.', () => {
			act(() => {
				render(<RadioButtonGroupTestForm radioButtonGroupName="test" />);
			});

			expect(screen.getByTestId('test-one').checked).toEqual(false);
			expect(screen.getByTestId('test-two').checked).toEqual(false);
			expect(screen.getByTestId('test-three').checked).toEqual(false);
		});

		it('should check the radio button of which the value matches the default value string.', () => {
			act(() => {
				render(<RadioButtonGroupTestForm radioButtonGroupName="test" defaultValue="two" />);
			});

			expect(screen.getByTestId('test-one').checked).toEqual(false);
			expect(screen.getByTestId('test-two').checked).toEqual(true);
			expect(screen.getByTestId('test-three').checked).toEqual(false);
		});
	});

	describe('registerRadioButton', () => {
		it('should not update the useForm hook\'s ref list when called with no value parameter.', () => {
			const radioButtonGroupName = 'test';
			let initialFieldsList;
			let useFormResults;
			let sut;

			const expectedFieldsList = {
				[radioButtonGroupName]: {
					name: radioButtonGroupName,
					isRadioButtonGroup: true,
					rules: {},
					one: expect.anything(),
				},
			};

			testHook(() => {
				useFormResults = useForm();
				sut = useRadioButtonGroup({ name: radioButtonGroupName }, useFormResults.formContext);
			});

			act(() => {
				sut.register({ value: 'one' });
				initialFieldsList = JSON.parse(JSON.stringify(useFormResults.formContext.fieldsRef.current));
				sut.unitTestingExports.registerRadioButton({ noValue: null });
			});

			const fieldList = useFormResults.formContext.fieldsRef.current;
			expect(initialFieldsList).toStrictEqual(expectedFieldsList);
			expect(fieldList).toEqual(initialFieldsList);
		});

		it('should add a new ref to the useForm hook\'s ref list when called with a new value.', () => {
			const formRef = createRef();
			const radioButtonGroupName = 'test';

			act(() => {
				render(<RadioButtonGroupTestForm ref={formRef} radioButtonGroupName={radioButtonGroupName} />);
			});
			const expectedFieldList = {
				test: {
					isRadioButtonGroup: true,
					name: radioButtonGroupName,
					rules: {},
					one: { value: expect.any(String), ref: expect.anything() },
					two: { value: expect.any(String), ref: expect.anything() },
					three: { value: expect.any(String), ref: expect.anything() },
				},
			};

			const actualfieldRefList = formRef.current.getContext().fieldsRef.current;
			expect(actualfieldRefList).toEqual(expectedFieldList);
		});
	});

	describe('unregisterRadioButton', () => {
		it('should not update the ref list if the parent group isn\'t registered.', () => {
			const radioButtonGroupName = 'test';
			let initialFieldsList;
			let useFormResults;
			let sut;

			const expectedFieldList = {};

			testHook(() => {
				useFormResults = useForm();
				sut = useRadioButtonGroup({ name: radioButtonGroupName }, useFormResults.formContext);
			});

			act(() => {
				initialFieldsList = JSON.parse(JSON.stringify(useFormResults.formContext.fieldsRef.current));
				sut.unitTestingExports.unregisterRadioButton('two');
			});

			const updatedFieldList = useFormResults.formContext.fieldsRef.current;
			expect(initialFieldsList).toStrictEqual(expectedFieldList);
			expect(updatedFieldList).toStrictEqual(expectedFieldList);
			expect(initialFieldsList).toStrictEqual(updatedFieldList);
		});

		it('should not update the ref list if called with an unregistered value.', () => {
			const radioButtonGroupName = 'test';
			let initialFieldsList;
			let useFormResults;
			let sut;

			const expectedFieldList = {
				[radioButtonGroupName]: {
					name: radioButtonGroupName,
					isRadioButtonGroup: true,
					rules: {},
					one: { id: `${radioButtonGroupName}-one`, name: radioButtonGroupName, value: 'one' },
					two: { id: `${radioButtonGroupName}-two`, name: radioButtonGroupName, value: 'two' },
				},
			};

			testHook(() => {
				useFormResults = useForm();
				sut = useRadioButtonGroup({ name: radioButtonGroupName }, useFormResults.formContext);
			});

			act(() => {
				sut.register({ value: 'one' });
				sut.register({ value: 'two' });
				initialFieldsList = JSON.parse(JSON.stringify(useFormResults.formContext.fieldsRef.current));
				sut.unitTestingExports.unregisterRadioButton('three');
			});

			const updatedFieldList = useFormResults.formContext.fieldsRef.current;
			expect(initialFieldsList).toStrictEqual(expectedFieldList);
			expect(updatedFieldList).toStrictEqual(expectedFieldList);
			expect(initialFieldsList).toStrictEqual(updatedFieldList);
		});

		it('should remove the reference linked to the provided radio button value from the ref list.', () => {
			const radioButtonGroupName = 'test';
			let initialFieldsList;
			let useFormResults;
			let sut;

			const expectedInitialFieldsList = {
				[radioButtonGroupName]: {
					name: radioButtonGroupName,
					isRadioButtonGroup: true,
					rules: {},
					one: { id: `${radioButtonGroupName}-one`, name: radioButtonGroupName, value: 'one' },
					two: { id: `${radioButtonGroupName}-two`, name: radioButtonGroupName, value: 'two' },
					three: { id: `${radioButtonGroupName}-three`, name: radioButtonGroupName, value: 'three' },
				},
			};

			const expectedFieldList = {
				[radioButtonGroupName]: {
					one: { id: `${radioButtonGroupName}-one`, name: radioButtonGroupName, value: 'one' },
					three: { id: `${radioButtonGroupName}-three`, name: radioButtonGroupName, value: 'three' },
				},
			};

			testHook(() => {
				useFormResults = useForm();
				sut = useRadioButtonGroup({ name: radioButtonGroupName }, useFormResults.formContext);
			});

			act(() => {
				sut.register({ value: 'one' });
				sut.register({ value: 'two' });
				sut.register({ value: 'three' });
				initialFieldsList = JSON.parse(JSON.stringify(useFormResults.formContext.fieldsRef.current));
				sut.unitTestingExports.unregisterRadioButton('two');
			});

			const updatedFieldList = useFormResults.formContext.fieldsRef.current;
			expect(initialFieldsList).toStrictEqual(expectedInitialFieldsList);
			expect(updatedFieldList).not.toEqual(initialFieldsList);
			expect(updatedFieldList).toMatchObject(expectedFieldList);
		});
	});

	describe('register', () => {
		it('should not update the useForm hook\'s ref list when called with no value parameter.', () => {
			const radioButtonGroupName = 'test';
			let initialFieldsList;
			let useFormResults;
			let sut;

			const expectedFieldsList = {
				[radioButtonGroupName]: {
					name: radioButtonGroupName,
					isRadioButtonGroup: true,
					rules: {},
					one: expect.anything(),
				},
			};

			testHook(() => {
				useFormResults = useForm();
				sut = useRadioButtonGroup({ name: radioButtonGroupName }, useFormResults.formContext);
			});

			act(() => {
				sut.register({ value: 'one' });
				initialFieldsList = JSON.parse(JSON.stringify(useFormResults.formContext.fieldsRef.current));
				sut.register();
			});

			const fieldList = useFormResults.formContext.fieldsRef.current;
			expect(initialFieldsList).toStrictEqual(expectedFieldsList);
			expect(fieldList).toEqual(initialFieldsList);
		});

		it('should create a radioButtonGroup reference in the form\'s ref list if it doesn\'t exist.', () => {
			const radioButtonGroupName = 'test';
			let useFormResults;
			let sut;

			const expectedInitialFieldsRef = {};
			const expectedFieldList = {
				[radioButtonGroupName]: {
					isRadioButtonGroup: true,
					name: radioButtonGroupName,
				},
			};

			testHook(() => {
				useFormResults = useForm();
				sut = useRadioButtonGroup({ name: radioButtonGroupName }, useFormResults.formContext);
			});

			const initialFieldsRef = JSON.parse(JSON.stringify(useFormResults.formContext.fieldsRef.current));

			act(() => {
				sut.register({ value: 'one' });
			});
			const updatedFieldRef = useFormResults.formContext.fieldsRef.current;

			expect(initialFieldsRef).toStrictEqual(expectedInitialFieldsRef);
			expect(updatedFieldRef).not.toEqual(initialFieldsRef);
			expect(updatedFieldRef).toMatchObject(expectedFieldList);
		});

		it('should only register the provided name, value and options when called with provided arguments for the first time.', async () => {
			const radioButtonGroupName = 'test';
			let useFormResults;
			let sut;

			const expectedFieldList = {
				[radioButtonGroupName]: {
					isRadioButtonGroup: true,
					name: radioButtonGroupName,
					one: {
						id: `${radioButtonGroupName}-one`,
						name: radioButtonGroupName,
						value: expect.anything(),
					},
				},
			};

			const unexpectedFieldList = {
				[radioButtonGroupName]: {
					isRadioButtonGroup: true,
					name: radioButtonGroupName,
					one: {
						ref: expect.anything(),
						id: `${radioButtonGroupName}-one`,
						name: radioButtonGroupName,
						value: 'one',
					},
				},
			};

			testHook(() => {
				useFormResults = useForm();
				sut = useRadioButtonGroup({ name: radioButtonGroupName }, useFormResults.formContext);
			});

			act(() => {
				sut.register({ value: 'one' });
			});

			const fieldsRef = useFormResults.formContext.fieldsRef.current;

			expect(fieldsRef).toMatchObject(expectedFieldList);
			expect(fieldsRef).not.toMatchObject(unexpectedFieldList);
		});

		it('should return all the arguments it has been provided along with a string id, name and a "ref" callback method.', () => {
			const radioButtonGroupName = 'test';
			const callParameters = { value: 'one', a: 'b', c: 'd' };
			let callResult;
			let useFormResults;
			let sut;

			const expectedResult = {
				id: expect.any(String),
				name: expect.any(String),
				ref: expect.any(Function),
				defaultChecked: expect.any(Boolean),
			};

			testHook(() => {
				useFormResults = useForm();
				sut = useRadioButtonGroup({ name: radioButtonGroupName }, useFormResults.formContext);
			});

			act(() => {
				callResult = sut.register(callParameters);
			});

			expect(callResult).toMatchObject(expectedResult);
		});

		it('should return an onChange implementation if useForm has been called with validateOnChange.', async () => {
			const radioButtonGroupName = 'test';
			let callResult;
			let useFormResults;
			let sut;

			const expectedResult = {
				onChange: expect.any(Function),
			};

			testHook(() => {
				useFormResults = useForm({ validateOnChange: true });
				sut = useRadioButtonGroup({ name: radioButtonGroupName, rules: {} }, useFormResults.formContext);
			});

			await act(async () => {
				callResult = sut.register({ value: 'one' });
			});

			expect(callResult).toMatchObject(expectedResult);
		});
	});
});
