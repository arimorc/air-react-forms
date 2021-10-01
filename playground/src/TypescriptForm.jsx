import { useForm, Validators } from 'air-react-forms';
import { useCallback, useState } from 'react';

/**
 * @name TypescriptForm
 * @description An example of form using the new typescript library.
 *
 * @author Timothée Simon-Franza
 */
const TypescriptForm = () => {
	const { formContext: { fields, formState }, register, handleSubmit } = useForm({ validateOnChange: true });

	console.log(formState.errors);
	const logFields = useCallback(() => {
		Object.keys(fields).forEach((fieldName) => {
			console.log(fieldName, fields[fieldName].value, fields[fieldName].errors);
		});
	}, [fields]);

	const onSubmit = useCallback((formData) => {
		console.log(formData);
	}, []);

	const [toggle, setToggle] = useState(false);

	const formFields = {
		firstName: {
			name: 'firstName',
			id: 'firstName',
			defaultValue: 'john',
			type: 'text',
			rules: {
				required: Validators.isRequired('This field is required'),
				maxLength: Validators.hasMaxLength(8, 'Please provide a value of 8 or less characters'),
			},
		},
		lastName: {
			name: 'lastName',
			id: 'lastName',
			defaultValue: 'doe',
			type: 'text',
			rules: {
				required: Validators.isRequired('This field is required'),
				customValidator: (value) => (value.trim().length === 0 ? 'custom validator error message' : ''),
			},
		},
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<h2>Simple form (single file)</h2>
			{toggle && (
				<>
					<label htmlFor="firstName">First name</label>
					<input {...register(formFields.firstName)} />
				</>
			)}
			<label htmlFor="lastName">Last name</label>
			<input {...register(formFields.lastName)} />

			<button type="button" onClick={() => setToggle(!toggle)}>toggle</button>
			<button type="button" onClick={() => logFields()}>Log fields</button>
			<button type="submit">Submit form</button>
		</form>
	);
};

export default TypescriptForm;
