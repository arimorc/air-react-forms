import useForm from '../../src/hooks/useForm';
import testHook from './hookTestUtils';

describe('useForm hook', () => {
	let sut;

	beforeEach(() => {
		testHook(() => {
			sut = useForm();
		});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('registerFormField', () => {
		afterEach(() => {
			jest.restoreAllMocks();
		});

		it('should add new a ref to the ref list when called with a new field name.', () => {
			const dummyFieldRef = { name: 'dummy_field', rules: {}, element: { value: '' } };

			sut.registerFormField(dummyFieldRef);

			expect(sut.getFieldsRefs()).toEqual({ [dummyFieldRef.name]: dummyFieldRef });
		});

		it('should ignore the call if the provided ref doesn\'t have a name attribute.', () => {
			const invalidDummyFieldRef = { rules: {}, element: { value: '' } };

			sut.registerFormField(invalidDummyFieldRef);

			expect(sut.getFieldsRefs()).toEqual({});
		});

		it('should replace an existing ref with the provided value if its name is already in the list.', () => {
			const dummyFieldRef = { name: 'dummy_field', rules: {}, element: { value: '' } };
			const updatedFieldRef = { ...dummyFieldRef, rules: { required: 'Please provide a value' } };

			sut.registerFormField(dummyFieldRef);
			sut.registerFormField(updatedFieldRef);

			expect(sut.getFieldsRefs()).toEqual({ [dummyFieldRef.name]: updatedFieldRef });
		});
	});

	describe('unregisterFormField', () => {
		it('should remove the reference linked to the provided name if it exists in the list.', () => {
			const dummyFieldRef = { name: 'dummy_field', rules: {}, element: { value: '' } };

			sut.registerFormField(dummyFieldRef);
			expect(sut.getFieldsRefs()).toEqual({ [dummyFieldRef.name]: dummyFieldRef });

			sut.unregisterFormField(dummyFieldRef.name);
			expect(sut.getFieldsRefs()).toEqual({});
		});

		it('should ignore the call if the provided name is absent from the ref list.', () => {
			const dummyFieldRef = { name: 'dummy_field', rules: {}, element: { value: '' } };

			sut.registerFormField(dummyFieldRef);
			expect(sut.getFieldsRefs()).toEqual({ [dummyFieldRef.name]: dummyFieldRef });

			sut.unregisterFormField('an_unknown_ref_name');
			expect(sut.getFieldsRefs()).toEqual({ [dummyFieldRef.name]: dummyFieldRef });
		});
	});

	describe('getFormValues', () => {
		it('should return all controlled fields\' values bundled into a single object', () => {
			const dummyFormFieldsRefs = [
				{ name: 'firstname', rules: {}, element: { value: 'john' } },
				{ name: 'lastname', rules: {}, element: { value: 'doe' } },
				{ name: 'age', rules: {}, element: { value: 35 } },
				{ name: 'unfilledInput', rules: {}, element: { value: '' } },
			];
			dummyFormFieldsRefs.forEach((fieldRef) => sut.registerFormField(fieldRef));

			const expectedResult = {
				firstname: 'john',
				lastname: 'doe',
				age: 35,
				unfilledInput: '',
			};

			expect(sut.getFormValues()).toEqual(expectedResult);
		});

		it('should return an empty object if no fields is referenced', () => {
			expect(sut.getFormValues()).toEqual({});
		});
	});

	describe('handleSubmit', () => {
		it('should prevent the default form submission event', () => {
			const event = { preventDefault: () => {} };
			const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

			sut.handleSubmit(event);

			expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
		});

		it('should return the result of the getFormValues method', () => {
			const event = { preventDefault: () => {} };
			const dummyFormFieldsRefs = [
				{ name: 'firstname', rules: {}, element: { value: 'john' } },
				{ name: 'lastname', rules: {}, element: { value: 'doe' } },
				{ name: 'age', rules: {}, element: { value: 35 } },
				{ name: 'unfilledInput', rules: {}, element: { value: '' } },
			];
			dummyFormFieldsRefs.forEach((fieldRef) => sut.registerFormField(fieldRef));

			expect(sut.handleSubmit(event)).toEqual(sut.getFormValues());
		});
	});

	describe('getFieldsRefs', () => {
		it('should return the current list of referenced fields', () => {
			const dummyFormFieldsRefs = [
				{ name: 'firstname', rules: {}, element: { value: 'john' } },
				{ name: 'lastname', rules: {}, element: { value: 'doe' } },
			];

			const nonReferencedFieldRef = { name: 'age', rules: {}, element: { value: 35 } };

			const expectedResult = {
				firstname: dummyFormFieldsRefs[0],
				lastname: dummyFormFieldsRefs[1],
			};

			dummyFormFieldsRefs.forEach((fieldRef) => sut.registerFormField(fieldRef));

			expect(sut.getFieldsRefs()).toEqual(expectedResult);
			expect(sut.getFieldsRefs()).not.toMatchObject({ [nonReferencedFieldRef.name]: nonReferencedFieldRef });
		});
	});
});
