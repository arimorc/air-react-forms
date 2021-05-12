import { createRef } from 'react';
import { mount, shallow } from 'enzyme';
import { act, fireEvent, render, screen } from '@testing-library/react';
import testHook from './hookTestUtils';
import FieldArrayTestForm from './FieldArrayTestForm';
import logger from '../../src/utils/logger';
import { useForm } from '../../src';

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
		it('should return the specified field\'s value if said field is referenced', () => {
			const dummyFieldRef = { name: 'dummy_field', rules: {}, type: 'text', defaultValue: 'test value' };
			const expectedResult = [dummyFieldRef.name, dummyFieldRef.defaultValue];

			mount(<input data-testid="dummy_field" {...sut.register(dummyFieldRef)} />);

			expect(sut.formContext.getFieldValue(
				sut.formContext.fieldsRef.current[dummyFieldRef.name]
			)).toStrictEqual(expectedResult);
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

		it('should return undefined in lieu of the value if the provided field has no ref', async () => {
			const dummyFieldRef = { name: 'dummy_field', rules: {}, type: 'text', defaultValue: 'test value' };
			const expectedResult = [dummyFieldRef.name, undefined];

			render(<input data-testid="dummy_field" {...sut.register(dummyFieldRef)} />);

			expect(sut.formContext.getFieldValue({ name: dummyFieldRef.name })).toStrictEqual(expectedResult);
		});
	});

	describe('getFieldArrayValues', () => {
		it('should return all values of a field array in the form of an array.', () => {
			const formRef = createRef();

			act(() => {
				mount(<FieldArrayTestForm defaultValue="abcd" fieldArrayName="test" ref={formRef} />);
				formRef.current.append();
			});

			const expectedResult = ['test', ['abcd']];

			expect(formRef.current.getFieldArrayValues(
				formRef.current.getContext().fieldsRef.current.test
			)).toEqual(expectedResult);
		});

		it('should return an empty object if no fields is referenced', () => {
			const formRef = createRef();

			act(() => {
				mount(<FieldArrayTestForm defaultValue="abcd" fieldArrayName="test" ref={formRef} />);
				formRef.current.append(); // required for the fieldArray to be properly registered.
				formRef.current.remove('test-0'); // 'test-0' is the name of the first input generated.
			});

			const expectedResult = ['test', []];

			expect(formRef.current.getFieldArrayValues(
				formRef.current.getContext().fieldsRef.current.test
			)).toEqual(expectedResult);
		});
	});

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

		// @TODO: test with fieldArray values as well.

		it('should return an empty object if no fields is referenced', () => {
			expect(sut.getFormValues()).toEqual({});
		});
	});

	describe('register', () => {
		it('should throw an error when called without a name attribute', () => {
			const invalidField = { name: undefined, rules: {} };

			expect(() => shallow(<input {...sut.register(invalidField)} />)).toThrowError();
		});

		it('should return an onChange implementation if useForm has been called with validateOnChange', () => {
			testHook(() => {
				sut = useForm({ validateOnChange: true });
			});

			const dummyFieldRef = { name: 'dummy_field' };
			const result = sut.register(dummyFieldRef);

			expect(result).toEqual(
				expect.objectContaining(
					{ onChange: expect.any(Function) },
				),
				expect.anything(),
			);
		});

		it('should return all the arguments it has been provided', () => {
			const dummyFieldArguments = { name: 'dummy_field', a: 'b', c: 'd' };
			const result = sut.register(dummyFieldArguments);

			expect(result).toEqual(
				expect.objectContaining({
					name: dummyFieldArguments.name,
					a: dummyFieldArguments.a,
					c: dummyFieldArguments.c,
				}),
				expect.anything(),
			);
		});
	});

	describe('registerFormField', () => {
		it('should add new a ref to the ref list when called with a new field name.', () => {
			const dummyFieldRef = { name: 'dummy_field', rules: {} };
			mount(<input {...sut.register(dummyFieldRef)} />);
			const expectedRefList = {
				dummy_field: {
					name: 'dummy_field',
					rules: {},
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
		it('should remove the reference linked to the provided name if it exists in the list.', () => {
			const dummyFieldRef = { name: 'dummy_field', rules: {} };
			const wrapper = mount(<input {...sut.register(dummyFieldRef)} />);

			expect(sut.getFieldsRefs()).toEqual({ [dummyFieldRef.name]: { ...dummyFieldRef, ref: expect.anything() } });

			wrapper.unmount();
			expect(sut.getFieldsRefs()).toEqual({});
		});
	});

	describe('handleSubmit', () => {
		it('should prevent the default form submission event', () => {
			const event = { preventDefault: () => {} };
			const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

			act(() => {
				sut.handleSubmit(event);
			});

			expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
		});

		it('should return the result of the getFormValues method', () => {
			const event = { preventDefault: () => {} };
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
			let submitResult;

			act(() => {
				submitResult = sut.handleSubmit(event);
			});

			expect(submitResult).toEqual(sut.getFormValues());
		});
	});

	describe('getFieldsRefs', () => {
		it('should return the current list of referenced fields', () => {
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

	describe('validate', () => {
		const isRequiredValidator = jest.fn();
		const hasMinLengthValidator = jest.fn();

		beforeEach(() => {
			isRequiredValidator.mockImplementation((value) => (value.trim().length === 0 ? 'required' : ''));
			hasMinLengthValidator.mockImplementation((value) => (value.trim().length < 8 ? 'should be at least 8 chars' : ''));
		});

		it('should return an empty object if no field is provided', () => {
			expect(sut.validate(undefined, {})).toStrictEqual({});
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
				await formRef.current.append();
				await formRef.current.append();
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

		// @TODO: check recursive calls when provided a fieldArray.
	});

	describe('validateField', () => {
		const isRequiredValidator = jest.fn();
		const hasLengthValidator = jest.fn();
		const hasMaxLengthValidator = jest.fn();
		let loggerWarnSpy = null;

		beforeEach(() => {
			loggerWarnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});
			isRequiredValidator.mockImplementation((value) => (value.trim().length === 0 ? 'required' : ''));
			hasLengthValidator.mockImplementation((value) => (value.trim().length !== 4 ? 'should be 4 chars' : ''));
			hasMaxLengthValidator.mockImplementation((value) => (value.trim().length > 6 ? 'must be less than 6 characters' : ''));
		});

		it('should ignore fields without validation rules', () => {
			const dummyFieldRef = { name: 'dummy_field' };
			mount(<input {...sut.register(dummyFieldRef)} />);

			act(() => sut.validateField('dummy_field'));

			expect(isRequiredValidator).toHaveBeenCalledTimes(0);
			expect(hasLengthValidator).toHaveBeenCalledTimes(0);
			expect(hasMaxLengthValidator).toHaveBeenCalledTimes(0);
		});

		it('should ignore calls with unreferenced field names', () => {
			const dummyFieldRef = { name: 'dummy_field', rules: { isRequired: isRequiredValidator } };
			mount(<input {...sut.register(dummyFieldRef)} />);

			isRequiredValidator.mockReset(); // Obligatory since registerFormField will call a validation on received field.
			sut.validateField('unreference_field');

			expect(isRequiredValidator).toHaveBeenCalledTimes(0);
		});

		it('should trigger a console warning when called with an unreferenced field\'s name in non-production mode', () => {
			const dummyFieldRef = { name: 'dummy_field', rules: { isRequired: isRequiredValidator } };
			mount(<input {...sut.register(dummyFieldRef)} />);

			isRequiredValidator.mockReset(); // Obligatory since registerFormField will call a validation on received field.
			sut.validateField('unreference_field');

			expect(isRequiredValidator).toHaveBeenCalledTimes(0);
			expect(loggerWarnSpy).toHaveBeenCalledTimes(1);
			expect(loggerWarnSpy).toHaveBeenCalledWith('tried to apply form validation on unreferenced field unreference_field');
		});

		it('should not trigger a console warning when called with an unreferenced field\'s name in production mode', () => {
			const initialNodeEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = 'production';

			const dummyFieldRef = { name: 'dummy_field', rules: { isRequired: isRequiredValidator } };
			mount(<input {...sut.register(dummyFieldRef)} />);

			isRequiredValidator.mockReset(); // Obligatory since registerFormField will call a validation on received field.
			sut.validateField('unreference_field');

			expect(isRequiredValidator).toHaveBeenCalledTimes(0);
			expect(loggerWarnSpy).not.toHaveBeenCalled();
			process.env.NODE_ENV = initialNodeEnv;
		});

		it('should call the specified validation methods', () => {
			const dummyFieldRef = { name: 'dummy_field', rules: { isRequired: isRequiredValidator, hasLength: hasLengthValidator } };
			mount(<input {...sut.register(dummyFieldRef)} />);

			act(() => sut.validateField('dummy_field'));

			// We expect two calls for each validation methods : one triggered by the registerFormField call, the other by the validateField call.
			expect(isRequiredValidator).toHaveBeenCalledTimes(2);
			expect(hasLengthValidator).toHaveBeenCalledTimes(2);
		});

		it('should only fill the formState\'s error field with failed validators\' messages', () => {
			const dummyFieldRef = { name: 'dummy_field', rules: { isRequired: isRequiredValidator, maxLength: hasMaxLengthValidator } };
			mount(<input {...sut.register(dummyFieldRef)} />);

			act(() => sut.validateField('dummy_field'));

			// We expect two calls for each validation methods : one triggered by the registerFormField call, the other by the validateField call.
			expect(isRequiredValidator).toHaveBeenCalledTimes(2);
			expect(hasMaxLengthValidator).toHaveBeenCalledTimes(2);

			expect(sut.formState.errors).toMatchObject({ [dummyFieldRef.name]: { isRequired: isRequiredValidator('') } });
			expect(sut.formState.errors).not.toMatchObject({ [dummyFieldRef.name]: { maxLength: isRequiredValidator('valueWithMoreThanSixChars') } });
		});

		it('should create the fieldname\'s errors field in the formstate if it does not already exist', () => {
			const dummyFieldRef = { name: 'dummy_field', rules: { isRequired: isRequiredValidator } };
			expect(sut.formState.errors).not.toMatchObject({ [dummyFieldRef.name]: expect.anything() });

			mount(<input {...sut.register(dummyFieldRef)} />);
			act(() => sut.validateField('dummy_field'));

			expect(sut.formState.errors).toMatchObject({ [dummyFieldRef.name]: expect.anything() });
		});

		it('should remove obsolete errors when fixed', () => {
			const dummyFieldRef = { name: 'dummy_field', rules: { isRequired: isRequiredValidator, maxLength: hasMaxLengthValidator } };
			render(<input data-testid="dummy_field" {...sut.register(dummyFieldRef)} />);

			act(() => sut.validateField('dummy_field'));

			// We expect two calls for each validation methods : one triggered by the registerFormField call, the other by the validateField call.
			expect(isRequiredValidator).toHaveBeenCalledTimes(2);
			expect(hasMaxLengthValidator).toHaveBeenCalledTimes(2);

			expect(sut.formState.errors).toMatchObject({ [dummyFieldRef.name]: { isRequired: isRequiredValidator('') } });

			act(() => {
				fireEvent.change(screen.getByTestId('dummy_field'), { target: { value: 'abcd' } });
				sut.validateField('dummy_field');
			});

			expect(sut.formState.errors).not.toMatchObject({ [dummyFieldRef.name]: { isRequired: isRequiredValidator('') } });
		});

		it('should update the exported state if the shouldUpdateState param is true', async () => {
			testHook(() => {
				sut = useForm({ validateOnChange: true });
			});

			const dummyFieldRef = { name: 'dummy_field', rules: { isRequired: isRequiredValidator } };
			render(<input data-testid="dummy_field" {...sut.register(dummyFieldRef)} value="abcd" />);

			expect(sut.formState).toEqual({ errors: { dummy_field: {} }, isDirty: false });

			act(() => {
				fireEvent.change(screen.getByTestId('dummy_field'), { target: { value: '' } });
			});

			expect(sut.formState).toEqual({ errors: { dummy_field: { isRequired: 'required' } }, isDirty: false });
		});
	});

	describe('validateFieldArrayInput', () => {
		let loggerWarnSpy = null;

		beforeEach(() => {
			loggerWarnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});
		});

		it('should trigger a console warning when called with an unreferenced fieldArray name.', () => {
			const dummyFieldRef = { name: 'dummy_field', rules: {} };
			const unregisteredFieldArrayName = 'unregistered-field-array';

			mount(<input {...sut.register(dummyFieldRef)} />);
			sut.formContext.validateFieldArrayInput(false)(`${unregisteredFieldArrayName}-0`, unregisteredFieldArrayName);

			expect(loggerWarnSpy).toHaveBeenCalledTimes(1);
			expect(loggerWarnSpy).toHaveBeenCalledWith(`tried to apply field validation on field from a non-registered field array ${unregisteredFieldArrayName}`);
		});

		it('should trigger a console warning when called with a referenced fieldArray name but unreferenced field.', async () => {
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
				await formRef.current.append();
				await formRef.current.append();
				await formRef.current.getContext().validateFieldArrayInput(false)(`${fieldArrayName}-5`, fieldArrayName);
			});

			expect(loggerWarnSpy).toHaveBeenCalledTimes(1);
			expect(loggerWarnSpy).toHaveBeenCalledWith(`tried to apply field validation on a non-registered field ${fieldArrayName}-5`);
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
				await formRef.current.append();
				await formRef.current.append();
				await formRef.current.getContext().validateFieldArrayInput(false)(`${fieldArrayName}-0`, fieldArrayName);
			});

			const expectedResult = {
				...initialFormStateValue,
				errors: {
					...initialFormStateValue.errors,
					[fieldArrayName]: expect.anything(),
				},
			};

			expect(loggerWarnSpy).toHaveBeenCalledTimes(0);
			expect(initialFormStateValue).not.toMatchObject({ errors: { [fieldArrayName]: expect.anything() } });
			expect(formRef.current.getContext().formStateRef.current).toMatchObject(expectedResult);
		});

		// @TODO: test syncStateWithRef call after completion if called with the souldUpdateState param set to true
	});

	describe('validateFieldArray', () => {
		let loggerWarnSpy = null;

		beforeEach(() => {
			loggerWarnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});
		});

		it('should trigger a console warning when called with an unreferenced fieldArray name in a non-production environment.', () => {
			const initialNodeEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = 'development';

			const dummyFieldRef = { name: 'dummy_field', rules: {} };
			const unregisteredFieldArrayName = 'unregistered-field-array';

			mount(<input {...sut.register(dummyFieldRef)} />);
			sut.validateFieldArray(unregisteredFieldArrayName);

			expect(loggerWarnSpy).toHaveBeenCalledTimes(1);
			expect(loggerWarnSpy).toHaveBeenCalledWith(`tried to apply field validation on a non-registered field array ${unregisteredFieldArrayName}`);

			process.env.NODE_ENV = initialNodeEnv;
		});

		it('should not trigger a console warning when called with an unreferenced fieldArray name in a production environment.', () => {
			const initialNodeEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = 'production';

			const dummyFieldRef = { name: 'dummy_field', rules: {} };
			const unregisteredFieldArrayName = 'unregistered-field-array';

			mount(<input {...sut.register(dummyFieldRef)} />);
			sut.validateFieldArray(unregisteredFieldArrayName);

			expect(loggerWarnSpy).toHaveBeenCalledTimes(0);
			process.env.NODE_ENV = initialNodeEnv;
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
				await formRef.current.append();
				await formRef.current.append();
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

			expect(loggerWarnSpy).toHaveBeenCalledTimes(0);
			expect(initialFormStateValue).toMatchObject(expectedInitialState);
			expect(formRef.current.getContext().formStateRef.current).toMatchObject(expectedUpdatedState);
		});

		// @TODO: test that the method calls the validate method for each field registered under the specified fieldArray.
	});
});
