import { Fragment, useState } from 'react';
import { useFieldArray, useForm, Validators, FormProvider } from 'air-react-forms';

/**
 * @name SimpleForm
 * @description An example of form usable using a single file
 *
 * @author Yann Hodiesne
 */
const SimpleForm = () => {
	const { formContext, formState: { errors }, handleSubmit, register } = useForm({ validateOnChange: true });
	const [formData, setFormData] = useState({});
	const [toggle, setToggle] = useState(false);
	const { fields, register: registerArrayField, remove } = useFieldArray({
		name: 'test',
		rules: {
			required: Validators.isRequired('required, pal !'),
			customValidator: (value) => (value.trim().length === 0 ? 'custom validator error message' : ''),
		},
	}, formContext);

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
		age: {
			name: 'age',
			id: 'age',
			type: 'number',
		},
		color: {
			name: 'color',
			id: 'color',
			type: 'color',
		},
		hasUsedHooks: {
			name: 'hasUsedHooks',
			id: 'hasUsedHooks',
			rules: {
				customValidator: (value) => (value.trim().length === 0 ? 'custom validator error message' : ''),
			},
		},
	};

	return (
		<FormProvider context={formContext}>
			<form onSubmit={(e) => setFormData(handleSubmit(e))}>
				<h2>Simple form (single file)</h2>
				{toggle && (
					<>
						<label htmlFor="firstName">First name</label>
						<input {...register(formFields.firstName)} />
						{errors.firstName?.required && <span>{errors.firstName.required}</span>}
						{errors.firstName?.maxLength && <span>{errors.firstName.maxLength}</span>}
					</>
				)}
				<button type="button" onClick={() => setToggle(!toggle)}>toggle</button>

				<>
					<label htmlFor="lastName">Last name</label>
					<input {...register(formFields.lastName)} />
					<div>
						{errors.lastName?.required && <span>{errors.lastName.required}</span>}
					</div>
				</>

				<>
					<label htmlFor="age">Age</label>
					<input {...register(formFields.age)} />
					<div>
						{errors.age?.required && <span>{errors.age.required}</span>}
					</div>
				</>

				<>
					<label htmlFor="color">Favorite color</label>
					<input {...register(formFields.color)} />
					<div>
						{errors.color?.required && <span>{errors.color.required}</span>}
					</div>
				</>

				<>
					<label htmlFor="hasUsedHooks">Ever used hooks before ?</label>
					<select {...register(formFields.hasUsedHooks)}>
						<option value="">Select a value</option>
						<option value="yes">yes</option>
						<option value="no">No</option>
						<option value="maybe">Maybe</option>
						{/* eslint-disable-next-line react/no-unescaped-entities */}
						<option value="I don't know">I don't know...</option>
						<option value="Can you repeat the question ?">Can you repeat the question ?</option>
					</select>
					<div>
						{errors.hasUsedHooks?.customValidator && <span>{errors.hasUsedHooks.customValidator}</span>}
					</div>
				</>

				{fields.map((field) => (
					<Fragment key={field.id}>
						<label htmlFor={field.id}>{field.name}</label>
						<div style={{ display: 'flex' }}>
							<input {...registerArrayField(field)} />
							<button type="button" onClick={() => remove(field)}>remove</button>
						</div>
						{errors.test?.[field.name]?.required && <span>{errors.test?.[field.name]?.required}</span>}
					</Fragment>
				))}
				<div>
					<button type="button" onClick={registerArrayField}>Add field</button>
					<button type="submit">Submit</button>
				</div>
			</form>
			<h3>Form data</h3>
			<pre>{JSON.stringify(formData, null, 2)}</pre>

			<h3>Form validation errors</h3>
			<pre>{JSON.stringify(errors, null, 2)}</pre>
		</FormProvider>
	);
};

export default SimpleForm;
