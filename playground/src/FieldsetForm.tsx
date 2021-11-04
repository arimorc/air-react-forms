import { FormProvider, useFieldset, useForm, Validators } from 'air-react-forms';
import { useCallback } from 'react';

/**
 *
 */
const FieldsetForm = () => {
	const { formContext, handleSubmit } = useForm({ validateOnChange: true });
	const { fields, register: registerFieldsetField } = useFieldset({
		id: 'contact',
		name: 'contact',
	}, formContext);

	const formFields = {
		firstname: {
			id: 'firstname',
			name: 'firstname',
			defaultValue: 'john',
			type: 'text',
			rules: {
				required: Validators.isRequired('This field is required'),
			},
		},
	};

	const onSubmit = useCallback((formData) => {
		console.log(formData);
	}, []);

	return (
		<FormProvider context={formContext}>
			<form onSubmit={handleSubmit(onSubmit)}>
				<fieldset>
					<label htmlFor="firstname">first name</label>
					<input type="text" {...registerFieldsetField(formFields.firstname)} />
					{fields?.firstname?.errors?.required && <span>{fields?.firstname?.errors?.required}</span>}
				</fieldset>
				<input type="submit" />
			</form>
		</FormProvider>
	);
};

export default FieldsetForm;
