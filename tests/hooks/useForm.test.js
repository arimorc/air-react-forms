import { createRef } from 'react';
import { mount, shallow } from 'enzyme';
import { act, fireEvent, render, screen } from '@testing-library/react';
import testHook from '../testUtils/hookTestUtils';
import FieldArrayTestForm from '../testUtils/FieldArrayTestForm';
import { useForm } from '../../src';
import * as inputTypeUtils from '../../src/utils/inputTypeUtils';

describe('useForm hook', () => {
	let sut;

	beforeEach(() => {
		testHook(() => {
			sut = useForm();
		});
	});

	afterEach(() => {
		jest.resetAllMocks();
		jest.restoreAllMocks();
	});

	describe('hook call result', () => {
		it('should return multiple methods and attributes when called', () => {
			const expectedValues = {
				formState: {
					errors: {},
					isDirty: false,
				},
				getFieldsRefs: expect.any(Function),
				getFormValues: expect.any(Function),
				handleSubmit: expect.any(Function),
				register: expect.any(Function),
				validateField: expect.any(Function),
			};

			expect(sut).toMatchObject(expectedValues);
		});
	});

	describe('syncStateWithRef', () => {
		it('should update the exported state with the latest formstate value', async () => {
			const isRequiredValidator = jest.fn().mockImplementation((value) => (value.trim().length === 0 ? 'required' : ''));
			const dummyFieldRef = { name: 'dummy_field', defaultValue: 'test value', rules: { required: isRequiredValidator } };

			const expectedFirstState = {
				errors: {
					dummy_field: {
						required: undefined,
					},
				},
			};

			const expectedResult = {
				errors: {
					dummy_field: {
						required: 'required',
					},
				},
			};

			render(<input data-testid="dummy_field" {...sut.register(dummyFieldRef)} />);
			expect(sut.formState).toMatchObject(expectedFirstState);

			await act(async () => {
				await fireEvent.change(screen.getByTestId('dummy_field'), { target: { value: '' } });
				sut.validateField('dummy_field'); // syncStateWithRef is called by the exported version of the validateField method.
			});
			expect(isRequiredValidator).toHaveBeenCalledTimes(2);
			expect(sut.formState).toMatchObject(expectedResult);
		});
	});

	describe('getFieldValue', () => {
		it('should return the provided field\'s value if said field has a ref property with value', () => {
			const dummyFieldRef = { name: 'dummy_field', rules: {}, type: 'text', defaultValue: 'test value' };
			const expectedResult = [dummyFieldRef.name, dummyFieldRef.defaultValue];

			mount(<input data-testid="dummy_field" {...sut.register(dummyFieldRef)} />);
			const result = sut.formContext.getFieldValue(sut.formContext.fieldsRef.current[dummyFieldRef.name]);

			expect(result).toStrictEqual(expectedResult);
		});

		it('should return the provided field\'s "checked" field value if said field has a ref property with "checkbox" type', () => {
			const dummyFieldRef1 = { name: 'dummy_checkbox_field_1', type: 'checkbox', checked: true };
			const dummyFieldRef2 = { name: 'dummy_checkbox_field_2', type: 'checkbox', checked: false };

			const expectedResult1 = [dummyFieldRef1.name, dummyFieldRef1.checked];
			const expectedResult2 = [dummyFieldRef2.name, dummyFieldRef2.checked];

			mount(
				<>
					<input data-testid="dummy_checkbox_field_1" {...sut.register(dummyFieldRef1)} />
					<input data-testid="dummy_checkbox_field-2" {...sut.register(dummyFieldRef2)} />
				</>
			);
			const result1 = sut.formContext.getFieldValue(sut.formContext.fieldsRef.current[dummyFieldRef1.name]);
			const result2 = sut.formContext.getFieldValue(sut.formContext.fieldsRef.current[dummyFieldRef2.name]);

			expect(result1).toStrictEqual(expectedResult1);
			expect(result2).toStrictEqual(expectedResult2);
		});

		it('should return undefined in lieu of the value if the provided field has no ref', async () => {
			const dummyFieldRef = { name: 'dummy_field', rules: {}, type: 'text', defaultValue: 'test value' };
			const expectedResult = [dummyFieldRef.name, undefined];

			render(<input data-testid="dummy_field" {...sut.register(dummyFieldRef)} />);

			expect(sut.formContext.getFieldValue({ name: dummyFieldRef.name })).toStrictEqual(expectedResult);
		});

		it('should return a realtime value of the provided field', async () => {
			const dummyFieldRef = { name: 'dummy_field', rules: {}, type: 'text', defaultValue: 'test value' };
			const expectedResult = [dummyFieldRef.name, 'updated value'];

			render(<input data-testid="dummy_field" {...sut.register(dummyFieldRef)} />);

			expect(sut.formContext.getFieldValue(
				sut.formContext.fieldsRef.current[dummyFieldRef.name]
			)).toStrictEqual([dummyFieldRef.name, dummyFieldRef.defaultValue]);

			await act(async () => {
				await fireEvent.change(screen.getByTestId('dummy_field'), { target: { value: 'updated value' } });
			});

			expect(sut.formContext.getFieldValue(
				sut.formContext.fieldsRef.current[dummyFieldRef.name]
			)).toStrictEqual(expectedResult);
		});
	});

	describe('getFieldArrayValues', () => {
		it('should return the values of the provided field array\'s fields that have a ref property in the form of an array.', async () => {
			expect.assertions(4);
			const formRef = createRef();

			await act(async () => {
				render(<FieldArrayTestForm defaultValue="abcd" fieldArrayName="test" ref={formRef} />);
				await formRef.current.registerArrayField();
				await formRef.current.registerArrayField();
				await formRef.current.registerArrayField();
				await fireEvent.change(screen.getByTestId('test-1'), { target: { value: 'efgh' } });
				await fireEvent.change(screen.getByTestId('test-2'), { target: { value: 'ijkl' } });
			});

			const expectedResult = ['test', ['abcd', 'efgh', 'ijkl']];

			const actualResult = formRef.current.getFieldArrayValues(formRef.current.getContext().fieldsRef.current.test);
			expect(Array.isArray(actualResult)).toBe(true);
			expect(actualResult.length).toEqual(2);
			expect(actualResult[0]).toEqual(expectedResult[0]);
			expect(actualResult[1]).toEqual(expect.arrayContaining(expectedResult[1]));
		});

		it('should return an empty array if no fields is referenced', () => {
			const formRef = createRef();

			act(() => {
				mount(<FieldArrayTestForm defaultValue="abcd" fieldArrayName="test" ref={formRef} />);
				formRef.current.registerArrayField(); // required for the fieldArray to be properly registered.
				formRef.current.remove('test-0'); // 'test-0' is the name of the first input generated.
			});

			const expectedResult = ['test', []];
			const actualResult = formRef.current.getFieldArrayValues(formRef.current.getContext().fieldsRef.current.test);

			expect(actualResult).toEqual(expectedResult);
		});
	});

	// @TODO: test the getCheckboxGroupValues method.

	describe('getFormValues', () => {
		it('should return all controlled fields\' values bundled into a single object', () => {
			const dummyFormFieldsRefs = [
				{ id: 0, name: 'firstname', rules: {}, type: 'text', defaultValue: 'john' },
				{ id: 1, name: 'lastname', rules: {}, type: 'text', defaultValue: 'doe' },
				{ id: 2, name: 'age', rules: {}, type: 'number', defaultValue: 35 },
				{ id: 3, name: 'unfilledInput', type: 'text', rules: {} },
			];

			mount(
				<>
					{dummyFormFieldsRefs.map((field) => <input key={field.id} {...sut.register(field)} />)}
				</>
			);

			const expectedResult = {
				firstname: 'john',
				lastname: 'doe',
				age: '35',
				unfilledInput: '',
			};
			const result = sut.getFormValues();
			expect(result).toStrictEqual(expectedResult);
		});

		it('should return values of all controlled fields, including fieldArrays\' inputs, bundled into a single object', async () => {
			const formRef = createRef();

			await act(async () => {
				render(<FieldArrayTestForm defaultValue="abcd" fieldArrayName="test" ref={formRef} />);
				await formRef.current.registerArrayField();
				await formRef.current.registerArrayField();
				await formRef.current.registerArrayField();
				fireEvent.change(screen.getByTestId('test-1'), { target: { value: 'efgh' } });
				fireEvent.change(screen.getByTestId('test-2'), { target: { value: 'ijkl' } });
			});

			const expectedResult = { test: ['abcd', 'efgh', 'ijkl'] };
			const actualResult = formRef.current.getContext().getFormValues();

			expect(actualResult).toMatchObject({ test: expect.arrayContaining(expectedResult.test) });
			expect(actualResult.test.length).toBe(expectedResult.test.length);
		});

		// @TODO: test the method with a checkboxGroup hook usage.

		it('should return an empty object if no fields is referenced', () => {
			expect(sut.getFormValues()).toEqual({});
		});
	});

	describe('validate', () => {
		const isRequiredValidator = jest.fn();
		const hasMinLengthValidator = jest.fn();

		beforeEach(() => {
			isRequiredValidator.mockImplementation((value) => (value.trim().length === 0 ? 'required' : ''));
			hasMinLengthValidator.mockImplementation((value) => (value.trim().length < 8 ? 'should be at least 8 chars' : ''));
		});

		it('should return an empty object if no field is provided', () => {
			expect(sut.validate(undefined)).toStrictEqual({});
		});

		it('should return a key value pair with the field\'s name as key and an empty object as value if no validation rule is provided.', () => {
			const dummyFieldRef = { name: 'dummy_field' };
			const expectedResult = { dummy_field: {} };

			mount(<input {...sut.register(dummyFieldRef)} />);

			expect(sut.validate(sut.getFieldsRefs().dummy_field)).toStrictEqual(expectedResult);
		});

		it('should return an empty object if no validation rule is provided (field array version).', async () => {
			const formRef = createRef();

			await act(async () => {
				mount(
					<FieldArrayTestForm
						defaultValue="abcd"
						fieldArrayName="test"
						ref={formRef}
					/>
				);
				await formRef.current.registerArrayField();
				await formRef.current.registerArrayField();
			});

			const validationResults = formRef.current.getUseFormResults().validate(formRef.current.getContext().fieldsRef.current.skurt);

			expect(validationResults).toStrictEqual({});
		});

		it('should return undefined as value for each validation rule that passed successfully', () => {
			const dummyFieldRef = {
				name: 'dummy_field',
				defaultValue: 'abcd',
				rules: { required: isRequiredValidator, minLength: hasMinLengthValidator },
			};
			const expectedResult = {
				dummy_field: {
					required: undefined, // validation should have passed
					minLength: 'should be at least 8 chars', // validation should have failed
				},
			};

			mount(<input {...sut.register(dummyFieldRef)} />);

			expect(sut.validate(sut.getFieldsRefs().dummy_field)).toStrictEqual(expectedResult);
		});

		it('should return validation results in the expected format.', () => {
			const dummyFieldRef = { name: 'dummy_field', rules: { isRequired: isRequiredValidator } };
			const expectedResult = { dummy_field: { isRequired: 'required' } };

			mount(<input {...sut.register(dummyFieldRef)} />);

			expect(sut.validate(sut.getFieldsRefs().dummy_field)).toStrictEqual(expectedResult);
		});

		it('should return validation results in the expected format (field array version).', async () => {
			const formRef = createRef();

			await act(async () => {
				mount(
					<FieldArrayTestForm
						defaultValue="abcd"
						fieldArrayName="test"
						fieldArrayRules={{
							isRequired: isRequiredValidator,
							minLength: hasMinLengthValidator,
						}}
						ref={formRef}
					/>
				);
				await formRef.current.registerArrayField();
				await formRef.current.registerArrayField();
			});
			const expectedResult = {
				test: {
					'test-0': {
						isRequired: undefined,
						minLength: 'should be at least 8 chars',
					},
					'test-1': {
						isRequired: undefined,
						minLength: 'should be at least 8 chars',
					},
				},
			};

			const validationResults = formRef.current.getUseFormResults().validate(formRef.current.getContext().fieldsRef.current.test);

			expect(validationResults).toStrictEqual(expectedResult);
		});
	});

	describe('validateFieldArrayInput', () => {
		let consoleWarnSpy = null;

		beforeEach(() => {
			consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
		});

		it('should trigger a console warning when called with an unreferenced fieldArray name in non-production mode.', () => {
			const dummyFieldRef = { name: 'dummy_field', rules: {} };
			const unregisteredFieldArrayName = 'unregistered-field-array';

			mount(<input {...sut.register(dummyFieldRef)} />);
			sut.formContext.validateFieldArrayInput(false)(`${unregisteredFieldArrayName}-0`, unregisteredFieldArrayName);

			expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
			expect(consoleWarnSpy).toHaveBeenCalledWith(
				'%s : %s',
				'[air-react-forms]',
				`tried to apply field validation on field from a non-registered field array ${unregisteredFieldArrayName}`,
			);
		});

		it('should not trigger a console warning when called with an unreferenced fieldArray name in production mode.', () => {
			const initialNodeEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = 'production';
			const dummyFieldRef = { name: 'dummy_field', rules: {} };
			const unregisteredFieldArrayName = 'unregistered-field-array';

			mount(<input {...sut.register(dummyFieldRef)} />);
			sut.formContext.validateFieldArrayInput(false)(`${unregisteredFieldArrayName}-0`, unregisteredFieldArrayName);

			expect(consoleWarnSpy).toHaveBeenCalledTimes(0);
			process.env.NODE_ENV = initialNodeEnv;
		});

		it('should trigger a console warning when called with a referenced fieldArray name but unreferenced field in non-production mode', async () => {
			const formRef = createRef();
			const fieldArrayName = 'referenced-field-array';

			await act(async () => {
				mount(
					<FieldArrayTestForm
						defaultValue="abcd"
						fieldArrayName={fieldArrayName}
						fieldArrayRules={{}}
						ref={formRef}
					/>
				);
				await formRef.current.registerArrayField();
				await formRef.current.registerArrayField();
				await formRef.current.getContext().validateFieldArrayInput(false)(`${fieldArrayName}-5`, fieldArrayName);
			});

			expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
			expect(consoleWarnSpy).toHaveBeenCalledWith(
				'%s : %s',
				'[air-react-forms]',
				`tried to apply field validation on a non-registered field ${fieldArrayName}-5`,
			);
		});

		it('should not trigger a console warning when called with a referenced fieldArray name but unreferenced field in production mode.', async () => {
			const initialNodeEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = 'production';
			const formRef = createRef();
			const fieldArrayName = 'referenced-field-array';

			await act(async () => {
				mount(
					<FieldArrayTestForm
						defaultValue="abcd"
						fieldArrayName={fieldArrayName}
						fieldArrayRules={{}}
						ref={formRef}
					/>
				);
				await formRef.current.registerArrayField();
				await formRef.current.registerArrayField();
				await formRef.current.getContext().validateFieldArrayInput(false)(`${fieldArrayName}-5`, fieldArrayName);
			});

			expect(consoleWarnSpy).toHaveBeenCalledTimes(0);
			process.env.NODE_ENV = initialNodeEnv;
		});

		it('should not update the form\'s state when called with an unregistered field array name.', () => {
			const initialFormStateValue = JSON.parse(JSON.stringify({ ...sut.formState }));
			const unregisteredFieldArrayName = 'unregistered-field-array';
			sut.formContext.validateFieldArrayInput(true)(`${unregisteredFieldArrayName}-0`, unregisteredFieldArrayName);

			expect(sut.formState).toStrictEqual(initialFormStateValue);
		});

		it('should not update the form\'s statewhen called with an unregistered field array input name.', async () => {
			const formRef = createRef();
			const fieldArrayName = 'referenced-field-array';
			let initialFormStateValue;

			await act(async () => {
				mount(
					<FieldArrayTestForm
						fieldArrayName={fieldArrayName}
						ref={formRef}
					/>
				);
				initialFormStateValue = JSON.parse(JSON.stringify({ ...formRef.current.getContext().formStateRef.current }));
				await formRef.current.getContext().validateFieldArrayInput(true)(`${fieldArrayName}-99`, fieldArrayName);
			});

			expect(formRef.current.getContext().formStateRef.current).toStrictEqual(initialFormStateValue);
		});

		it('should create a new formState.errors field for the specified fieldArray if it doesn\'t exist yet.', async () => {
			const formRef = createRef();
			const fieldArrayName = 'referenced-field-array';
			let initialFormStateValue;

			await act(async () => {
				mount(
					<FieldArrayTestForm
						defaultValue="abcd"
						fieldArrayName={fieldArrayName}
						fieldArrayRules={{}}
						ref={formRef}
					/>
				);
				initialFormStateValue = JSON.parse(JSON.stringify({ ...formRef.current.getContext().formStateRef.current }));
				await formRef.current.registerArrayField();
				await formRef.current.registerArrayField();
				await formRef.current.getContext().validateFieldArrayInput(false)(`${fieldArrayName}-0`, fieldArrayName);
			});

			const expectedResult = {
				...initialFormStateValue,
				errors: {
					...initialFormStateValue.errors,
					[fieldArrayName]: expect.anything(),
				},
			};

			expect(consoleWarnSpy).toHaveBeenCalledTimes(0);
			expect(initialFormStateValue).not.toMatchObject({ errors: { [fieldArrayName]: expect.anything() } });
			expect(formRef.current.getContext().formStateRef.current).toMatchObject(expectedResult);
		});

		it('should update the formstate.errors for the provided field if provided with validation rules.', async () => {
			const isRequiredValidator = jest.fn().mockImplementation((value) => (value.trim().length === 0 ? 'required' : ''));

			const formRef = createRef();
			const fieldArrayName = 'field-array';

			await act(async () => {
				render(
					<FieldArrayTestForm
						defaultValue="abcd"
						fieldArrayName={fieldArrayName}
						fieldArrayRules={{ required: isRequiredValidator }}
						ref={formRef}
					/>
				);
				await formRef.current.registerArrayField();
				await formRef.current.registerArrayField();
				await fireEvent.change(screen.getByTestId(`${fieldArrayName}-1`), { target: { value: '' } });
				await formRef.current.getContext().validateFieldArrayInput(false)(`${fieldArrayName}-1`, fieldArrayName);
			});

			const expectedResult = {
				errors: {
					[fieldArrayName]: {
						[`${fieldArrayName}-0`]: {
							required: undefined,
						},
						[`${fieldArrayName}-1`]: {
							required: 'required',
						},
					},
				},
			};

			expect(consoleWarnSpy).toHaveBeenCalledTimes(0);
			expect(formRef.current.getContext().formStateRef.current).toMatchObject(expectedResult);
		});
	});

	describe('validateFieldArray', () => {
		let consoleWarnSpy = null;

		beforeEach(() => {
			consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
		});

		it('should trigger a console warning when called with an unreferenced fieldArray name in a non-production environment.', () => {
			const initialNodeEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = 'development';

			const dummyFieldRef = { name: 'dummy_field', rules: {} };
			const unregisteredFieldArrayName = 'unregistered-field-array';

			mount(<input {...sut.register(dummyFieldRef)} />);
			sut.validateFieldArray(unregisteredFieldArrayName);

			expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
			expect(consoleWarnSpy).toHaveBeenCalledWith(
				'%s : %s',
				'[air-react-forms]',
				`tried to apply field validation on a non-registered field array ${unregisteredFieldArrayName}`,
			);

			process.env.NODE_ENV = initialNodeEnv;
		});

		it('should not trigger a console warning when called with an unreferenced fieldArray name in a production environment.', () => {
			const initialNodeEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = 'production';

			const dummyFieldRef = { name: 'dummy_field', rules: {} };
			const unregisteredFieldArrayName = 'unregistered-field-array';

			mount(<input {...sut.register(dummyFieldRef)} />);
			sut.validateFieldArray(unregisteredFieldArrayName);

			expect(consoleWarnSpy).toHaveBeenCalledTimes(0);
			process.env.NODE_ENV = initialNodeEnv;
		});

		it('should not update the form\'s state when called with an unreferenced fieldArray name.', () => {
			const initialFormStateValue = JSON.parse(JSON.stringify({ ...sut.formState }));

			sut.validateFieldArray('unregistered-field-array');

			expect(sut.formState).toStrictEqual(initialFormStateValue);
		});

		it('should update formState.errors field for the specified fieldArray with new validation results.', async () => {
			const formRef = createRef();
			const fieldArrayName = 'referenced-field-array';
			const isRequiredValidator = jest.fn().mockImplementation((value) => (value.trim().length === 0 ? 'required' : ''));

			let initialFormStateValue;

			await act(async () => {
				render(
					<FieldArrayTestForm
						defaultValue="abcd"
						fieldArrayName={fieldArrayName}
						fieldArrayRules={{
							required: isRequiredValidator,
						}}
						ref={formRef}
					/>
				);
				await formRef.current.registerArrayField();
				await formRef.current.registerArrayField();
				await formRef.current.getUseFormResults().validateFieldArray(fieldArrayName);
				initialFormStateValue = JSON.parse(JSON.stringify({ ...formRef.current.getContext().formStateRef.current }));

				fireEvent.change(screen.getByTestId(`${fieldArrayName}-0`), { target: { value: '' } });
			});

			const expectedInitialState = {
				errors: {
					[fieldArrayName]: {
						[`${fieldArrayName}-0`]: {},
						[`${fieldArrayName}-1`]: {},
					},
				},
			};

			const expectedUpdatedState = {
				...initialFormStateValue,
				errors: {
					...initialFormStateValue.errors,
					[fieldArrayName]: {
						[`${fieldArrayName}-0`]: { required: 'required' },
						[`${fieldArrayName}-1`]: expect.anything(),
					},
				},
			};

			expect(consoleWarnSpy).toHaveBeenCalledTimes(0);
			expect(initialFormStateValue).toMatchObject(expectedInitialState);
			expect(formRef.current.getContext().formStateRef.current).toMatchObject(expectedUpdatedState);
		});

		it('should update formState.errors field for the specified fieldArray with an empty object if no validation rule is provided.', async () => {
			const formRef = createRef();
			const fieldArrayName = 'referenced-field-array';

			await act(async () => {
				render(
					<FieldArrayTestForm
						defaultValue="abcd"
						fieldArrayName={fieldArrayName}
						ref={formRef}
					/>
				);
				await formRef.current.registerArrayField();
				await formRef.current.registerArrayField();
				await formRef.current.getUseFormResults().validateFieldArray(fieldArrayName);
			});

			const expectedUpdatedState = {
				errors: {
					[fieldArrayName]: {},
				},
				isDirty: false,
			};

			expect(consoleWarnSpy).toHaveBeenCalledTimes(0);
			expect(formRef.current.getContext().formStateRef.current).toEqual(expectedUpdatedState);
		});
	});

	describe('validateField', () => {
		const isRequiredValidator = jest.fn();
		const hasLengthValidator = jest.fn();
		const hasMaxLengthValidator = jest.fn();
		let consoleWarnSpy = null;

		beforeEach(() => {
			consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			isRequiredValidator.mockImplementation((value) => (value.trim().length === 0 ? 'required' : ''));
			hasLengthValidator.mockImplementation((value) => (value.trim().length !== 4 ? 'should be 4 chars' : ''));
			hasMaxLengthValidator.mockImplementation((value) => (value.trim().length > 6 ? 'must be less than 6 characters' : ''));
		});

		it('should trigger a console warning when called with an unreferenced field\'s name in non-production mode', () => {
			sut.validateField('unreference_field');

			expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
			expect(consoleWarnSpy).toHaveBeenCalledWith(
				'%s : %s',
				'[air-react-forms]',
				'tried to apply form validation on unreferenced field unreference_field',
			);
		});

		it('should not trigger a console warning when called with an unreferenced field\'s name in production mode', () => {
			const initialNodeEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = 'production';

			sut.validateField('unreference_field');

			expect(consoleWarnSpy).not.toHaveBeenCalled();
			process.env.NODE_ENV = initialNodeEnv;
		});

		it('should not update the form\'s state when called with unreferenced field names', () => {
			const initialFormStateValue = JSON.parse(JSON.stringify({ ...sut.formState }));
			sut.validateField('unreference_field');

			expect(initialFormStateValue).toStrictEqual(sut.formState);
		});

		it('should call the specified validation methods', () => {
			const dummyFieldRef = { name: 'dummy_field', rules: { isRequired: isRequiredValidator, hasLength: hasLengthValidator } };
			mount(<input {...sut.register(dummyFieldRef)} />);

			// The register method triggers a validation cycle, so we need to reset our call stack before running the test.
			isRequiredValidator.mockReset();
			hasLengthValidator.mockReset();

			act(() => sut.validateField('dummy_field'));

			expect(isRequiredValidator).toHaveBeenCalledTimes(1);
			expect(hasLengthValidator).toHaveBeenCalledTimes(1);
		});

		it('should create the fieldname\'s errors field in the formstate if it does not already exist', () => {
			const dummyFieldRef = { name: 'dummy_field', rules: { isRequired: isRequiredValidator } };
			expect(sut.formState.errors).not.toMatchObject({ [dummyFieldRef.name]: expect.anything() });

			mount(<input {...sut.register(dummyFieldRef)} />);
			act(() => sut.validateField('dummy_field'));

			expect(sut.formState.errors).toMatchObject({ [dummyFieldRef.name]: expect.anything() });
		});

		it('should update the form\'s state error field with validation results', () => {
			const dummyFieldRef = { name: 'dummy_field', rules: { required: isRequiredValidator, maxLength: hasMaxLengthValidator } };
			render(<input data-testid="dummy_field" {...sut.register(dummyFieldRef)} />);

			// The register method triggers a validation cycle, so we need to reset our call stack before running the test.
			isRequiredValidator.mockReset();
			hasMaxLengthValidator.mockReset();

			act(() => sut.validateField('dummy_field'));

			expect(isRequiredValidator).toHaveBeenCalledTimes(1);
			expect(hasMaxLengthValidator).toHaveBeenCalledTimes(1);

			// Should match { required: 'required', maxLength: undefined } since the required should fail and maxLength should pass.
			expect(sut.formState.errors).toMatchObject({
				[dummyFieldRef.name]: {
					required: isRequiredValidator(''),
					maxLength: hasMaxLengthValidator('valid'),
				},
			});

			act(() => {
				fireEvent.change(screen.getByTestId('dummy_field'), { target: { value: 'abcd' } });
				sut.validateField('dummy_field');
			});

			// Should now match { required: undefined, maxLength: undefined } since both checks should pass.
			expect(sut.formState.errors).toMatchObject({
				[dummyFieldRef.name]: {
					required: isRequiredValidator('valid'),
					maxLength: hasMaxLengthValidator('valid'),
				},
			});
		});
	});

	describe('registerFormField', () => {
		it('should add new a ref to the ref list when called with a new field name.', () => {
			const dummyFieldRef = { name: 'dummy_field' };
			mount(<input {...sut.register(dummyFieldRef)} />);
			const expectedRefList = {
				dummy_field: {
					name: dummyFieldRef.name,
					rules: expect.anything(),
					ref: expect.anything(),
				},
			};

			expect(sut.getFieldsRefs()).toStrictEqual(expectedRefList);
		});

		it('should replace an existing ref with the provided value if its name is already in the list.', () => {
			const dummyFieldRef = { name: 'dummy_field', rules: {} };
			const updatedFieldRef = { ...dummyFieldRef, rules: { required: jest.fn() } };
			mount(<input {...sut.register(dummyFieldRef)} />);

			expect(sut.getFieldsRefs()).toEqual({
				[dummyFieldRef.name]: {
					...dummyFieldRef,
					ref: expect.anything(),
				},
			});

			mount(<input {...sut.register(updatedFieldRef)} />);

			expect(sut.getFieldsRefs()).toEqual({
				[dummyFieldRef.name]: {
					...updatedFieldRef,
					ref: expect.anything(),
				},
			});
		});
	});

	describe('unregisterFormField', () => {
		it('should remove the reference linked to the provided name from the fields ref list and formState.', () => {
			const dummyFieldRef = { name: 'dummy_field', rules: {} };
			const wrapper = mount(<input {...sut.register(dummyFieldRef)} />);

			expect(sut.getFieldsRefs()).toMatchObject({ [dummyFieldRef.name]: { ...dummyFieldRef, ref: expect.anything() } });
			expect(sut.formState).toMatchObject({ errors: { [dummyFieldRef.name]: expect.anything() } });

			wrapper.unmount();

			expect(sut.getFieldsRefs()).not.toMatchObject({ [dummyFieldRef.name]: { ...dummyFieldRef, ref: expect.anything() } });
			expect(sut.formState).not.toMatchObject({ errors: { [dummyFieldRef.name]: expect.anything() } });
		});
	});

	describe('register', () => {
		it('should throw an error when called without a name attribute', () => {
			expect(() => shallow(<input {...sut.register({})} />)).toThrowError();
			expect(() => shallow(<input {...sut.register({ name: '' })} />)).toThrowError();
		});

		it('should only register the provided name, rules and options when called with provided arguments for the first time.', () => {
			const dummyFieldArguments = { name: 'dummy_field', a: 'b', c: 'd', type: 'text', rules: {} };
			sut.register(dummyFieldArguments);

			expect(sut.getFieldsRefs()).toStrictEqual({
				[dummyFieldArguments.name]: {
					...dummyFieldArguments,
				},
			});
		});

		it('should register a default \'text\' type if none is provided.', () => {
			const dummyFieldArguments = { name: 'dummy_field', a: 'b', c: 'd', rules: {} };
			sut.register(dummyFieldArguments);

			expect(sut.getFieldsRefs()).toStrictEqual({
				[dummyFieldArguments.name]: {
					...dummyFieldArguments,
					type: 'text',
				},
			});
		});

		it('should return all the arguments it has been provided along with a "ref" callback method.', () => {
			const dummyFieldArguments = { name: 'dummy_field', a: 'b', c: 'd', rules: {} };
			const result = sut.register(dummyFieldArguments);

			expect(result).toMatchObject({
				...dummyFieldArguments,
				ref: expect.any(Function),
			});
		});

		it('should return a defaultValue field with the result of the getDefaultValueByType method if none is provided', () => {
			const getDefaultValueSpy = jest.spyOn(inputTypeUtils, 'getDefaultValueByInputType');
			const dummyFieldArguments = { name: 'dummy_field', a: 'b', c: 'd', type: 'number', rules: {} };
			const result = sut.register(dummyFieldArguments);

			expect(result).toMatchObject({
				type: expect.any(String),
				defaultValue: expect.any(Number),
			});
			expect(getDefaultValueSpy).toHaveBeenCalledTimes(1);
			expect(result.defaultValue).toStrictEqual(inputTypeUtils.getDefaultValueByInputType(dummyFieldArguments.type));
		});

		it('should return an empty "rules" property if none has been provided.', () => {
			const dummyFieldArguments = { name: 'dummy_field', a: 'b', c: 'd' };
			const result = sut.register(dummyFieldArguments);

			expect(result).toMatchObject({
				rules: {},
			});
		});

		it('should return an onChange implementation if useForm has been called with validateOnChange.', () => {
			testHook(() => {
				sut = useForm({ validateOnChange: true });
			});

			const dummyFieldRef = { name: 'dummy_field' };
			const result = sut.register(dummyFieldRef);

			expect(result).toMatchObject({
				onChange: expect.any(Function),
			});
		});
	});

	describe('handleSubmit', () => {
		it('should prevent the default form submission event.', () => {
			const event = { preventDefault: () => {} };
			const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

			act(() => {
				sut.handleSubmit(() => {})(event);
			});

			expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
		});

		it('should not call the provided callback method if the form is invalid.', () => {
			const isRequiredValidator = jest.fn().mockImplementation((value) => (value.trim().length === 0 ? 'required' : ''));
			const dummyFieldRef = { name: 'dummy_field', rules: { required: isRequiredValidator } };
			const event = { preventDefault: () => {} };
			const callbackMock = jest.fn();

			render(<input {...sut.register(dummyFieldRef)} />);

			act(() => {
				sut.handleSubmit(callbackMock)(event);
			});

			expect(callbackMock).not.toHaveBeenCalled();
		});

		it('should call the provided callback method with the result of the getFormValues method.', () => {
			const event = { preventDefault: () => {} };
			const callbackMock = jest.fn();

			const dummyFormFieldsRefs = [
				{ id: 1, name: 'firstname' },
				{ id: 2, name: 'lastname' },
				{ id: 3, name: 'age' },
				{ id: 4, name: 'unfilledInput' },
			];

			mount(
				<>
					{dummyFormFieldsRefs.map((field) => <input key={field.id} {...sut.register(field)} />)}
				</>
			);

			act(() => {
				sut.handleSubmit(callbackMock)(event);
			});

			expect(callbackMock).toHaveBeenCalledTimes(1);
			expect(callbackMock).toHaveBeenCalledWith(sut.getFormValues());
		});
	});

	describe('isFormValid', () => {
		it('should return false if at least one validation check fails', () => {
			const isRequiredValidator = jest.fn().mockImplementation((value) => (value.trim().length === 0 ? 'required' : ''));
			const dummyFieldRef = { name: 'dummy_field', rules: { required: isRequiredValidator } };

			render(<input {...sut.register(dummyFieldRef)} />);

			expect(sut.isFormValid()).toEqual(false);
		});

		it('should return true if no validation rule has been registered', () => {
			const isRequiredValidator = jest.fn().mockImplementation((value) => (value.trim().length === 0 ? 'required' : ''));
			const dummyFieldRef = { defaultValue: 'abcd', name: 'dummy_field', rules: { required: isRequiredValidator } };

			render(<input {...sut.register(dummyFieldRef)} />);

			expect(sut.isFormValid()).toEqual(true);
		});

		it('should return true if all validation checks succeed', () => {
			const dummyFieldRef = { name: 'dummy_field', rules: {} };

			render(<input {...sut.register(dummyFieldRef)} />);

			expect(sut.isFormValid()).toEqual(true);
		});
	});

	describe('getFieldsRefs', () => {
		it('should return the current list of referenced fields.', () => {
			const dummyFormFieldsRefs = [
				{ id: 1, name: 'firstname', rules: {} },
				{ id: 2, name: 'lastname', rules: {} },
			];

			const nonReferencedFieldRef = { name: 'age', rules: {} };

			const expectedResult = {
				firstname: { ...dummyFormFieldsRefs[0], ref: expect.anything() },
				lastname: { ...dummyFormFieldsRefs[1], ref: expect.anything() },
			};

			mount(
				<>
					{dummyFormFieldsRefs.map((field) => <input key={field.id} {...sut.register(field)} />)}
				</>
			);

			expect(sut.getFieldsRefs()).toEqual(expectedResult);
			expect(sut.getFieldsRefs()).not.toMatchObject({ [nonReferencedFieldRef.name]: { ...nonReferencedFieldRef, ref: expect.anything() } });
		});
	});
});
