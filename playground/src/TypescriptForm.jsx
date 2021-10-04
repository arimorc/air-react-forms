import { useForm, Validators } from 'air-react-forms';
import { useCallback, useState } from 'react';

/**
 * @name TypescriptForm
 * @description An example of form using the new typescript library.
 *
 * @author Timothée Simon-Franza
 */
const TypescriptForm = () => {
	const { formContext: { fields }, formState: { errors }, register, handleSubmit } = useForm({ validateOnChange: true });

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
				maxLength: Validators.hasMaxLength(8, 'Please provide a value of 8 or less characters'),
			},
		},
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<h2>Simple form (single file)</h2>
			{toggle && (
				<div>
					<label htmlFor="firstName">First name</label>
					<input {...register(formFields.firstName)} />
					{errors.firstName?.required && <span>{errors.firstName.required}</span>}
					{errors.firstName?.maxLength && <span>{errors.firstName.maxLength}</span>}
				</div>
			)}
			<div>
				<label htmlFor="lastName">Last name</label>
				<input {...register(formFields.lastName)} />
				{errors.lastName?.required && <span>{errors.lastName.required}</span>}
				{errors.lastName?.maxLength && <span>{errors.lastName.maxLength}</span>}
			</div>

			<button type="button" onClick={() => setToggle(!toggle)}>toggle</button>
			<button type="button" onClick={() => logFields()}>Log fields</button>
			<button type="submit">Submit form</button>
		</form>
	);
};

export default TypescriptForm;
