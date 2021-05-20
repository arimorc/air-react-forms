import { createRef } from 'react';
import { mount } from 'enzyme';
import { act, render } from '@testing-library/react';
import FieldArrayTestForm from '../testUtils/FieldArrayTestForm';
import testHook from '../testUtils/hookTestUtils';
import logger from '../../src/utils/logger';
import { useForm, useFieldArray } from '../../src';
import * as inputTypeUtils from '../../src/utils/inputTypeUtils';

describe('useFieldArray hook', () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('hook call result', () => {
		it('should return multiple methods and attributes when called', () => {
			let useFormResults;
			let sut;

			testHook(() => {
				useFormResults = useForm();
				sut = useFieldArray({ name: 'fieldArray', rules: {} }, useFormResults.formContext);
			});

			const expectedValues = {
				append: expect.any(Function),
				fields: expect.any(Array),
				register: expect.any(Function),
				remove: expect.any(Function),
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
				expect(() => useFieldArray({ name: 'test-field-array' }, undefined)).toThrowError();
			});

			expect(loggerFatalSpy).toHaveBeenCalledTimes(1);

			process.env.NODE_ENV = initialNodeEnv;
		});
	});

	describe('registerField', () => {
		it('should add new a ref to the ref list when called with a new field name.', async () => {
			const formRef = createRef();
			const fieldArrayName = 'field-array';

			let initialFieldsList;
			const expectedFieldsList = [
				{ id: `${fieldArrayName}-0`, name: `${fieldArrayName}-0` },
				{ id: `${fieldArrayName}-1`, name: `${fieldArrayName}-1` },
			];

			await act(async () => {
				render(
					<FieldArrayTestForm
						fieldArrayName={fieldArrayName}
						ref={formRef}
					/>
				);
				initialFieldsList = JSON.parse(JSON.stringify(formRef.current.getFields()));
				await formRef.current.registerArrayField();
				await formRef.current.registerArrayField();
			});

			const fieldsList = formRef.current.getFields();

			expect(initialFieldsList).toStrictEqual([]);
			expect(fieldsList).not.toEqual(initialFieldsList);
			expect(fieldsList).toStrictEqual(expectedFieldsList);
		});
	});

	describe('unregisterField', () => {
		it('should remove the reference linked to the provided field name from the ref list.', async () => {
			const formRef = createRef();
			const fieldArrayName = 'field-array';

			let initialFieldsList;
			const expectedInitialFieldsList = {
				[fieldArrayName]: {
					[`${fieldArrayName}-0`]: { id: `${fieldArrayName}-0`, name: `${fieldArrayName}-0` },
					[`${fieldArrayName}-1`]: { id: `${fieldArrayName}-1`, name: `${fieldArrayName}-1` },
					[`${fieldArrayName}-2`]: { id: `${fieldArrayName}-2`, name: `${fieldArrayName}-2` },
				},
			};

			const expectedFieldsList = {
				[fieldArrayName]: {
					[`${fieldArrayName}-0`]: {
						id: `${fieldArrayName}-0`,
						name: `${fieldArrayName}-0`,
					},
				},
			};

			await act(async () => {
				const wrapper = mount(
					<FieldArrayTestForm
						fieldArrayName={fieldArrayName}
						ref={formRef}
					/>
				);
				await formRef.current.registerArrayField();
				await formRef.current.registerArrayField();
				await formRef.current.registerArrayField();
				wrapper.update();
				initialFieldsList = JSON.parse(
					JSON.stringify(
						formRef.current.getContext().fieldsRef.current,
						((key, value) => (key !== 'ref' ? value : null)) // we need to filter out ref to avoid circular dependancies
					)
				);
				await formRef.current.remove({ name: `${fieldArrayName}-1` });
				await formRef.current.remove({ name: `${fieldArrayName}-2` });
				wrapper.update();
			});

			const fieldsList = formRef.current.getContext().fieldsRef.current;

			expect(initialFieldsList).toMatchObject(expectedInitialFieldsList);
			expect(fieldsList).not.toMatchObject(initialFieldsList);
			expect(fieldsList).toMatchObject(expectedFieldsList);
		});

		it('should remove the form state\'s error entry linked to the provided field name if there is any.', async () => {
			const formRef = createRef();
			const fieldArrayName = 'field-array';
			const isRequiredValidator = jest.fn().mockImplementation((value) => (value.trim().length === 0 ? 'required' : ''));

			let initialFormState;
			const expectedInitialFormState = {
				errors: {
					[fieldArrayName]: {
						[`${fieldArrayName}-0`]: { required: 'required' },
						[`${fieldArrayName}-1`]: { required: 'required' },
					},
				},
				isDirty: false,
			};

			const expectedFormState = {
				errors: {
					[fieldArrayName]: {
						[`${fieldArrayName}-0`]: { required: 'required' },
					},
				},
				isDirty: false,
			};

			await act(async () => {
				mount(
					<FieldArrayTestForm
						fieldArrayName={fieldArrayName}
						fieldArrayRules={{ required: isRequiredValidator }}
						ref={formRef}
					/>
				);
				await formRef.current.registerArrayField();
				await formRef.current.registerArrayField();
				await formRef.current.getUseFormResults().validateFieldArray(fieldArrayName);
				initialFormState = JSON.parse(JSON.stringify(formRef.current.getContext().formStateRef.current));

				await formRef.current.remove({ name: `${fieldArrayName}-1` });
			});

			const formState = formRef.current.getContext().formStateRef.current;

			expect(initialFormState).toStrictEqual(expectedInitialFormState);
			expect(formState).not.toEqual(initialFormState);
			expect(formState).toStrictEqual(expectedFormState);
		});
	});

	describe('append', () => {
		it('should be an alias to register', () => {
			let sut;

			testHook(() => {
				const useFormResults = useForm();
				sut = useFieldArray({ name: 'field-array', rules: {} }, useFormResults.formContext);
			});

			expect(sut.append).toEqual(sut.register);
			expect(sut.append).toBe(sut.register);
			expect(sut.append).not.toEqual(sut.remove);
			expect(sut.append).not.toBe(sut.remove);
		});
	});

	describe('register', () => {
		it('should create a fieldArray reference in the form\'s ref list if none is linked to the current field', async () => {
			const fieldArrayName = 'fieldArray';
			let useFormResults;
			let sut;

			const expectedInitialFieldsRef = {};
			const expectedUpdatedFieldsRef = { [fieldArrayName]: {} };

			testHook(() => {
				useFormResults = useForm();
				sut = useFieldArray({ name: fieldArrayName, rules: {} }, useFormResults.formContext);
			});

			const initialFieldsRef = JSON.parse(JSON.stringify(useFormResults.formContext.fieldsRef.current));

			await act(async () => {
				sut.register();
			});

			const updatedFieldsRef = useFormResults.formContext.fieldsRef.current;

			expect(initialFieldsRef).toStrictEqual(expectedInitialFieldsRef);
			expect(updatedFieldsRef).not.toEqual(initialFieldsRef);
			expect(updatedFieldsRef).toMatchObject(expectedUpdatedFieldsRef);
		});

		it('should only register the provided name, rules and options when called with provided arguments for the first time.', async () => {
			const fieldArrayName = 'fieldArray';
			let useFormResults;
			let sut;

			const expectedFieldsRef = {
				[fieldArrayName]: {
					[`${fieldArrayName}-0`]: {
						id: `${fieldArrayName}-0`,
						name: `${fieldArrayName}-0`,
					},
				},
			};

			const unexpectedFieldsRef = {
				[fieldArrayName]: {
					[`${fieldArrayName}-0`]: {
						id: `${fieldArrayName}-0`,
						name: `${fieldArrayName}-0`,
						ref: expect.anything(),
					},
				},
			};

			testHook(() => {
				useFormResults = useForm();
				sut = useFieldArray({ name: fieldArrayName, rules: {} }, useFormResults.formContext);
			});

			await act(async () => {
				sut.register();
			});

			const fieldsRef = useFormResults.formContext.fieldsRef.current;

			expect(fieldsRef).toMatchObject(expectedFieldsRef);
			expect(fieldsRef).not.toMatchObject(unexpectedFieldsRef);
		});

		it('should return all the arguments it has been provided along with string id, name, type and a "ref" callback method.', async () => {
			const fieldArrayName = 'fieldArray';
			const callParameters = { a: 'b', c: 'd' };
			let callResult;
			let useFormResults;
			let sut;

			const expectedResult = {
				...callParameters,
				id: expect.any(String),
				name: expect.any(String),
				ref: expect.any(Function),
				type: expect.any(String),
			};

			testHook(() => {
				useFormResults = useForm();
				sut = useFieldArray({ name: fieldArrayName, rules: {} }, useFormResults.formContext);
			});

			await act(async () => {
				callResult = sut.register(callParameters);
			});

			expect(callResult).toMatchObject(expectedResult);
		});

		it('should return a type property equal to the inputType attribute provided to the useFieldArray hook if any.', async () => {
			const fieldArrayName = 'fieldArray';
			const inputType = 'number';
			let callResult;
			let sut;

			const expectedResult = {
				type: inputType,
			};

			testHook(() => {
				const useFormResults = useForm();
				sut = useFieldArray({ name: fieldArrayName, inputType, rules: {} }, useFormResults.formContext);
			});

			await act(async () => {
				callResult = sut.register();
			});

			expect(callResult).toMatchObject(expectedResult);
		});

		it('should return a defaultValue property with the result of the getDefaultValueByType method if none has been provided.', async () => {
			const getDefaultValueSpy = jest.spyOn(inputTypeUtils, 'getDefaultValueByInputType');
			const fieldArrayParams = { name: 'field-array', inputType: 'number' };
			let callResult;
			let useFormResults;
			let sut;

			const expectedResult = {
				type: fieldArrayParams.inputType,
				defaultValue: expect.any(Number),
			};

			testHook(() => {
				useFormResults = useForm();
				sut = useFieldArray(fieldArrayParams, useFormResults.formContext);
			});

			await act(async () => {
				callResult = sut.register();
			});

			expect(callResult).toMatchObject(expectedResult);
			expect(getDefaultValueSpy).toHaveBeenCalledTimes(1);
			expect(callResult.defaultValue).toStrictEqual(inputTypeUtils.getDefaultValueByInputType(fieldArrayParams.inputType));
		});

		it('should return an onChange implementation if useForm has been called with validateOnChange.', async () => {
			const fieldArrayName = 'fieldArray';
			let callResult;
			let useFormResults;
			let sut;

			const expectedResult = {
				onChange: expect.any(Function),
			};

			testHook(() => {
				useFormResults = useForm({ validateOnChange: true });
				sut = useFieldArray({ name: fieldArrayName, rules: {} }, useFormResults.formContext);
			});

			await act(async () => {
				callResult = sut.register();
			});

			expect(callResult).toMatchObject(expectedResult);
		});
	});

	describe('remove', () => {
		it('should remove the provided field name from the field array.', async () => {
			const formRef = createRef();
			const fieldArrayName = 'field-array';

			let initialFieldsList;
			const expectedInitialFieldsList = [
				{ id: `${fieldArrayName}-0`, name: `${fieldArrayName}-0` },
				{ id: `${fieldArrayName}-1`, name: `${fieldArrayName}-1` },
			];

			const expectedFieldsList = [
				{ id: `${fieldArrayName}-1`, name: `${fieldArrayName}-1` },
			];

			await act(async () => {
				const wrapper = mount(
					<FieldArrayTestForm
						fieldArrayName={fieldArrayName}
						ref={formRef}
					/>
				);
				await formRef.current.registerArrayField();
				await formRef.current.registerArrayField();
				wrapper.update();
				initialFieldsList = JSON.parse(JSON.stringify(formRef.current.getFields()));
				await formRef.current.remove({ name: `${fieldArrayName}-0` });
				wrapper.update();
			});

			const fieldsList = formRef.current.getFields();

			expect(initialFieldsList).toStrictEqual(expectedInitialFieldsList);
			expect(fieldsList).not.toEqual(initialFieldsList);
			expect(fieldsList).toStrictEqual(expectedFieldsList);
		});

		it('should remove the provided field name from the parent form\'s ref list.', async () => {
			const formRef = createRef();
			const fieldArrayName = 'field-array';

			let initialFieldsList;
			const expectedInitialFieldsList = {
				[fieldArrayName]: {
					isFieldArray: true,
					name: fieldArrayName,
					[`${fieldArrayName}-0`]: { id: `${fieldArrayName}-0`, name: `${fieldArrayName}-0` },
					[`${fieldArrayName}-1`]: { id: `${fieldArrayName}-1`, name: `${fieldArrayName}-1` },
				},
			};

			const expectedFieldsList = {
				[fieldArrayName]: {
					isFieldArray: true,
					name: fieldArrayName,
					[`${fieldArrayName}-1`]: { id: `${fieldArrayName}-1`, name: `${fieldArrayName}-1` },
				},
			};

			await act(async () => {
				const wrapper = mount(
					<FieldArrayTestForm
						fieldArrayName={fieldArrayName}
						ref={formRef}
					/>
				);
				await formRef.current.registerArrayField();
				await formRef.current.registerArrayField();
				wrapper.update();
				initialFieldsList = JSON.parse(
					JSON.stringify(
						formRef.current.getContext().fieldsRef.current,
						((key, value) => (key !== 'ref' ? value : null)) // we need to filter out ref to avoid circular dependancies
					)
				);
				await formRef.current.remove({ name: `${fieldArrayName}-0` });
				wrapper.update();
			});

			const fieldsList = formRef.current.getContext().fieldsRef.current;

			expect(initialFieldsList).toMatchObject(expectedInitialFieldsList);
			expect(fieldsList).not.toMatchObject(initialFieldsList);
			expect(fieldsList).toMatchObject(expectedFieldsList);
		});
	});
});
