import { act } from 'react-dom/test-utils';
import renderHook from '../testUtils/renderHook';
import { useFieldArray, useForm } from '../../src';
import { FieldArray, IUseFieldArrayReturn } from '../../src/types/fieldArray';
import { IUseFormReturn } from '../../src/types/form';

describe('useFieldArray Hook', () => {
	let useFormResult: IUseFormReturn;
	let sut: IUseFieldArrayReturn;

	const defaultFieldArrayProps = {
		id: 'system-under-test',
		name: 'system-under-test',
		type: 'text',
		defaultValue: '',
		rules: {},
		errors: {},
	};

	beforeEach(() => {
		renderHook(() => {
			useFormResult = useForm();
			sut = useFieldArray(defaultFieldArrayProps, useFormResult.formContext);
		});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	// @TODO: test the append method

	describe('fields', () => {
		it('should mirror the fieldArray\'s "field" field\'s value', () => {
			act(() => {
				sut.append();
				sut.append();
			});

			const fieldArray = useFormResult.formContext.fields[defaultFieldArrayProps.name] as FieldArray;
			expect(sut.fields).toEqual(fieldArray.fields);
		});
	});

	describe('register', () => {
		const dummyNewFieldData = {
			id: `${defaultFieldArrayProps.name}-field-0`,
			name: `${defaultFieldArrayProps.name}-field-0`,
			rules: defaultFieldArrayProps.rules,
			defaultValue: defaultFieldArrayProps.defaultValue,
			type: defaultFieldArrayProps.type,
		};

		it('should add a new Field object to the fieldArray\'s fields field if it is not already present', () => {
			const fieldArray = useFormResult.formContext.fields[defaultFieldArrayProps.name] as FieldArray;
			const initialFields = JSON.parse(JSON.stringify(fieldArray.fields));

			act(() => {
				sut.register(dummyNewFieldData);
			});

			expect(initialFields).toEqual({});
			expect(fieldArray.fields).toMatchObject({ [dummyNewFieldData.name]: dummyNewFieldData });
		});

		it('should not call fieldArray.addField if the field is already present.', () => {
			const addFieldSpy = jest.spyOn(FieldArray.prototype, 'addField');
			act(() => {
				sut.register(dummyNewFieldData);
				sut.register(dummyNewFieldData);
			});

			expect(addFieldSpy).toHaveBeenCalledTimes(1);
		});

		it('should return an IFieldReturnProps object', () => {
			let result;

			act(() => {
				result = sut.register(dummyNewFieldData);
			});

			expect(result).toEqual(
				expect.objectContaining({
					id: expect.any(String),
					name: expect.any(String),
					rules: expect.any(Object),
					type: expect.any(String),
					defaultValue: expect.any(String),
					ref: expect.any(Function),
				})
			);
		});

		it('should add an additional onChange method to the returned value if useForm is called with validateOnChange set to true', () => {
			renderHook(() => {
				useFormResult = useForm({ validateOnChange: true });
				sut = useFieldArray(defaultFieldArrayProps, useFormResult.formContext);
			});
			let result;

			act(() => {
				result = sut.register(dummyNewFieldData);
			});

			expect(result).toEqual(
				expect.objectContaining({ onChange: expect.any(Function) })
			);
		});
	});

	// describe('remove', () => {
	// 	it('', () => {

	// 	});
	// });
});
