import { mount } from 'enzyme';
import { render } from '@testing-library/react';
import FormFieldWrapper from '../../src/components/FormFieldWrapper';

describe('FormFieldWrapper component', () => {
	describe('Ref registration behavior', () => {
		afterEach(() => {
			jest.restoreAllMocks();
		});

		it('should call the registerFormField prop function on mount.', () => {
			const registerFormField = jest.fn();

			const wrapper = mount(
				<FormFieldWrapper name="dummy_form_field" registerFormField={registerFormField}>
					<input type="text" name="dummy_form_field" />
				</FormFieldWrapper>
			);

			expect(registerFormField).toHaveBeenCalledTimes(1);
			wrapper.unmount();
		});

		it('should pass its input reference along the name and rules props to the registerFormField prop function.', () => {
			const registerFormField = jest.fn();

			const wrapper = mount(
				<FormFieldWrapper name="dummy_form_field" registerFormField={registerFormField}>
					<input name="dummy_form_field" type="text" />
				</FormFieldWrapper>
			);

			expect(registerFormField).toHaveBeenCalledWith(expect.objectContaining({
				element: expect.anything(),
				name: expect.anything(),
				rules: expect.anything(),
			}));
			wrapper.unmount();
		});

		it('should only create reference for input typed children.', () => {
			let inputReference = null;

			const registerFormField = jest.fn().mockImplementation(({ element }) => { inputReference = element; });

			const wrapper = mount(
				<FormFieldWrapper name="dummy_form_field" registerFormField={registerFormField}>
					<label htmlFor="dummy_form_field_id">Dummy label</label>
					<input id="dummy_form_field_id" name="dummy_form_field" type="text" />
				</FormFieldWrapper>
			);

			const inputElement = wrapper.find('#dummy_form_field_id').getElement();
			const labelElement = wrapper.find('[htmlFor="dummy_form_field_id"]').getElement();

			expect(inputElement.ref.current).toEqual(inputReference);
			expect(labelElement.ref).toEqual(null);

			wrapper.unmount();
		});

		it('should call the unregisterFormField prop function on component unmount.', () => {
			const unregisterFormField = jest.fn();

			const { unmount } = render(
				<FormFieldWrapper name="dummy_form_field" unregisterFormField={unregisterFormField}>
					<input type="text" name="dummy_form_field" />
				</FormFieldWrapper>
			);

			unmount();
			expect(unregisterFormField).toHaveBeenCalledTimes(1);
		});
	});
});
