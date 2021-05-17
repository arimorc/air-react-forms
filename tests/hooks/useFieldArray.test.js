import { createRef } from 'react';
import { mount, shallow } from 'enzyme';
import { act, fireEvent, render, screen } from '@testing-library/react';
import FieldArrayTestForm from '../testUtils/FieldArrayTestForm';
import testHook from '../testUtils/hookTestUtils';
import { useForm, useFieldArray } from '../../src';

describe('useFieldArray hook', () => {
	describe('hook call result', () => {
		it('should return multiple methods and attributes when called', () => {
			let useFormResults;
			let sut;

			testHook(() => {
				useFormResults = useForm();
				sut = useFieldArray({ name: 'fieldArray', rules: {} }, useFormResults.formContext);
			});

			const expectedValues = {
				fields: expect.any(Array),
				getFieldsValues: expect.any(Function),
				register: expect.any(Function),
				remove: expect.any(Function),
				errors: {},
			};

			expect(sut).toMatchObject(expectedValues);
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
			const expectedInitialFieldsList = [
				{ id: `${fieldArrayName}-0`, name: `${fieldArrayName}-0` },
				{ id: `${fieldArrayName}-1`, name: `${fieldArrayName}-1` },
				{ id: `${fieldArrayName}-2`, name: `${fieldArrayName}-2` },
			];

			const expectedFieldsList = [
				{ id: `${fieldArrayName}-0`, name: `${fieldArrayName}-0` },
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
				await formRef.current.registerArrayField();
				wrapper.update();
				initialFieldsList = JSON.parse(JSON.stringify(formRef.current.getFields()));
				await formRef.current.remove({ name: `${fieldArrayName}-1` });
				await formRef.current.remove({ name: `${fieldArrayName}-2` });
				wrapper.update();
			});

			const fieldsList = formRef.current.getFields();

			expect(initialFieldsList).toStrictEqual(expectedInitialFieldsList);
			expect(fieldsList).not.toEqual(initialFieldsList);
			expect(fieldsList).toStrictEqual(expectedFieldsList);
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

	describe('register', () => {
		it('should create a fieldArray reference in the form\'s ref list if none is linked to the current field', () => {

		});

		it('should only register the provided name, rules and options when called with provided arguments for the first time.', () => {

		});

		it('should return all the arguments it has been provided along with a "ref" callback method.', () => {

		});

		it('should return a defaultValue property if none has been provided.', () => {

		});

		it('should return an onChange implementation if useForm has been called with validateOnChange.', () => {

		});
	});

	describe('remove', () => {
		it('should remove the provided field name from the field array', () => {

		});

		it('should call unregisterField with the provided field name.', () => {

		});
	});
});
