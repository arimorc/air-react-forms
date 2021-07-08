import { createRef } from 'react';
import { act, render, screen } from '@testing-library/react';
import logger from '../../src/utils/logger';
import { useForm, useCheckboxGroup } from '../../src';
import testHook from '../testUtils/hookTestUtils';
import CheckboxGroupTestForm from '../testUtils/CheckboxGroupTestForm';

describe('useCheckboxGroup hook', () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('hook call result', () => {
		it('should return multiple methods and attributes when called.', () => {
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

		it('should call logger.fatal if no context is provided to the hook.', () => {
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

	describe('default value provision', () => {
		it('should not check any checkbox if no default value object is provided.', () => {
			act(() => {
				render(<CheckboxGroupTestForm checkboxGroupName="test" />);
			});

			expect(screen.getByTestId('test-one').defaultChecked).toEqual(false);
			expect(screen.getByTestId('test-two').defaultChecked).toEqual(false);
			expect(screen.getByTestId('test-three').defaultChecked).toEqual(false);
		});

		it('should check checkbox of which the value appears as "true" in the default value object.', () => {
			act(() => {
				render(<CheckboxGroupTestForm checkboxGroupName="test" defaultValues={{ three: true }} />);
			});

			expect(screen.getByTestId('test-one').defaultChecked).toEqual(false);
			expect(screen.getByTestId('test-two').defaultChecked).toEqual(false);
			expect(screen.getByTestId('test-three').defaultChecked).toEqual(true);
		});
	});

	describe('registerCheckbox', () => {
		it('should not update the useForm hook\'s ref list when called with no value parameter.', () => {
			const checkboxGroupName = 'test';
			let initialFieldsList;
			let useFormResults;
			let sut;

			const expectedFieldsList = {
				[checkboxGroupName]: {
					name: checkboxGroupName,
					isCheckboxGroup: true,
					rules: {},
					one: expect.anything(),
				},
			};

			testHook(() => {
				useFormResults = useForm();
				sut = useCheckboxGroup({ name: checkboxGroupName }, useFormResults.formContext);
			});

			act(() => {
				sut.register({ value: 'one' });
				initialFieldsList = JSON.parse(JSON.stringify(useFormResults.formContext.fieldsRef.current));
				sut.unitTestingExports.registerCheckbox({ noValue: null });
			});

			const fieldList = useFormResults.formContext.fieldsRef.current;
			expect(initialFieldsList).toStrictEqual(expectedFieldsList);
			expect(fieldList).toEqual(initialFieldsList);
		});

		it('should add a new ref to the useForm hook\'s ref list when called with a new value.', () => {
			const formRef = createRef();
			const checkboxGroupName = 'test';

			act(() => {
				render(<CheckboxGroupTestForm ref={formRef} checkboxGroupName={checkboxGroupName} defaultValues={{ three: true }} />);
			});
			const expectedFieldList = {
				test: {
					isCheckboxGroup: true,
					name: checkboxGroupName,
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

	describe('unregisterCheckbox', () => {
		it('should not update the ref list if the parent group isn\'t registered.', () => {
			const checkboxGroupName = 'test';
			let initialFieldsList;
			let useFormResults;
			let sut;

			const expectedFieldList = {};

			testHook(() => {
				useFormResults = useForm();
				sut = useCheckboxGroup({ name: checkboxGroupName }, useFormResults.formContext);
			});

			act(() => {
				initialFieldsList = JSON.parse(JSON.stringify(useFormResults.formContext.fieldsRef.current));
				sut.unitTestingExports.unregisterCheckbox('two');
			});

			const updatedFieldList = useFormResults.formContext.fieldsRef.current;
			expect(initialFieldsList).toStrictEqual(expectedFieldList);
			expect(updatedFieldList).toStrictEqual(expectedFieldList);
			expect(initialFieldsList).toStrictEqual(updatedFieldList);
		});

		it('should not update the ref list if called with an unregistered value.', () => {
			const checkboxGroupName = 'test';
			let initialFieldsList;
			let useFormResults;
			let sut;

			const expectedFieldList = {
				[checkboxGroupName]: {
					name: checkboxGroupName,
					isCheckboxGroup: true,
					rules: {},
					one: { id: `${checkboxGroupName}-one`, name: checkboxGroupName, value: 'one' },
					two: { id: `${checkboxGroupName}-two`, name: checkboxGroupName, value: 'two' },
				},
			};

			testHook(() => {
				useFormResults = useForm();
				sut = useCheckboxGroup({ name: checkboxGroupName }, useFormResults.formContext);
			});

			act(() => {
				sut.register({ value: 'one' });
				sut.register({ value: 'two' });
				initialFieldsList = JSON.parse(JSON.stringify(useFormResults.formContext.fieldsRef.current));
				sut.unitTestingExports.unregisterCheckbox('three');
			});

			const updatedFieldList = useFormResults.formContext.fieldsRef.current;
			expect(initialFieldsList).toStrictEqual(expectedFieldList);
			expect(updatedFieldList).toStrictEqual(expectedFieldList);
			expect(initialFieldsList).toStrictEqual(updatedFieldList);
		});

		it('should remove the reference linked to the provided checkbox value from the ref list.', () => {
			const checkboxGroupName = 'test';
			let initialFieldsList;
			let useFormResults;
			let sut;

			const expectedInitialFieldsList = {
				[checkboxGroupName]: {
					name: checkboxGroupName,
					isCheckboxGroup: true,
					rules: {},
					one: { id: `${checkboxGroupName}-one`, name: checkboxGroupName, value: 'one' },
					two: { id: `${checkboxGroupName}-two`, name: checkboxGroupName, value: 'two' },
					three: { id: `${checkboxGroupName}-three`, name: checkboxGroupName, value: 'three' },
				},
			};

			const expectedFieldList = {
				[checkboxGroupName]: {
					one: { id: `${checkboxGroupName}-one`, name: checkboxGroupName, value: 'one' },
					three: { id: `${checkboxGroupName}-three`, name: checkboxGroupName, value: 'three' },
				},
			};

			testHook(() => {
				useFormResults = useForm();
				sut = useCheckboxGroup({ name: checkboxGroupName }, useFormResults.formContext);
			});

			act(() => {
				sut.register({ value: 'one' });
				sut.register({ value: 'two' });
				sut.register({ value: 'three' });
				initialFieldsList = JSON.parse(JSON.stringify(useFormResults.formContext.fieldsRef.current));
				sut.unitTestingExports.unregisterCheckbox('two');
			});

			const updatedFieldList = useFormResults.formContext.fieldsRef.current;
			expect(initialFieldsList).toStrictEqual(expectedInitialFieldsList);
			expect(updatedFieldList).not.toEqual(initialFieldsList);
			expect(updatedFieldList).toMatchObject(expectedFieldList);
		});
	});

	describe('register', () => {
		it('should not update the useForm hook\'s ref list when called with no value parameter.', () => {
			const checkboxGroupName = 'test';
			let initialFieldsList;
			let useFormResults;
			let sut;

			const expectedFieldsList = {
				[checkboxGroupName]: {
					name: checkboxGroupName,
					isCheckboxGroup: true,
					rules: {},
					one: expect.anything(),
				},
			};

			testHook(() => {
				useFormResults = useForm();
				sut = useCheckboxGroup({ name: checkboxGroupName }, useFormResults.formContext);
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

		it('should create a checkboxGroup reference in the form\'s ref list if it doesn\'t exist.', () => {
			const checkboxGroupName = 'test';
			let useFormResults;
			let sut;

			const expectedInitialFieldsRef = {};
			const expectedFieldList = {
				[checkboxGroupName]: {
					isCheckboxGroup: true,
					name: checkboxGroupName,
				},
			};

			testHook(() => {
				useFormResults = useForm();
				sut = useCheckboxGroup({ name: checkboxGroupName }, useFormResults.formContext);
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
			const checkboxGroupName = 'test';
			let useFormResults;
			let sut;

			const expectedFieldList = {
				[checkboxGroupName]: {
					isCheckboxGroup: true,
					name: checkboxGroupName,
					one: {
						id: `${checkboxGroupName}-one`,
						name: checkboxGroupName,
						value: expect.anything(),
					},
				},
			};

			const unexpectedFieldList = {
				[checkboxGroupName]: {
					isCheckboxGroup: true,
					name: checkboxGroupName,
					one: {
						ref: expect.anything(),
						id: `${checkboxGroupName}-one`,
						name: checkboxGroupName,
						value: 'one',
					},
				},
			};

			testHook(() => {
				useFormResults = useForm();
				sut = useCheckboxGroup({ name: checkboxGroupName }, useFormResults.formContext);
			});

			act(() => {
				sut.register({ value: 'one' });
			});

			const fieldsRef = useFormResults.formContext.fieldsRef.current;

			expect(fieldsRef).toMatchObject(expectedFieldList);
			expect(fieldsRef).not.toMatchObject(unexpectedFieldList);
		});

		it('should return all the arguments it has been provided along with a string id, name and a "ref" callback method.', () => {
			const checkboxGroupName = 'test';
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
				sut = useCheckboxGroup({ name: checkboxGroupName }, useFormResults.formContext);
			});

			act(() => {
				callResult = sut.register(callParameters);
			});

			expect(callResult).toMatchObject(expectedResult);
		});

		it('should return an onChange implementation if useForm has been called with validateOnChange.', async () => {
			const checkboxGroupName = 'test';
			let callResult;
			let useFormResults;
			let sut;

			const expectedResult = {
				onChange: expect.any(Function),
			};

			testHook(() => {
				useFormResults = useForm({ validateOnChange: true });
				sut = useCheckboxGroup({ name: checkboxGroupName, rules: {} }, useFormResults.formContext);
			});

			await act(async () => {
				callResult = sut.register({ value: 'one' });
			});

			expect(callResult).toMatchObject(expectedResult);
		});
	});
});
