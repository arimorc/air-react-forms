import { useState } from 'react';
import { useForm, Validators, FormProvider } from 'air-react-forms';
import FieldArray from './FieldArray';

/**
 * @name AdvancedForm
 * @description An example of form usable using a single file
 *
 * @author Yann Hodiesne
 */
const AdvancedForm = () => {
	const { formContext, formState: { errors }, handleSubmit, register } = useForm({ validateOnChange: true });
	const [formData, setFormData] = useState({});
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
		testArray: {
			name: 'test',
			rules: {
				required: Validators.isRequired('required, pal !'),
				customValidator: (value) => (value.trim().length === 0 ? 'custom validator error message' : ''),
			},
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
				<h2>Advanced form (multiple re-usable file)</h2>
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

				<FieldArray fieldDefinition={formFields.testArray} />

				<button type="submit">Submit</button>
			</form>
			<h3>Form data</h3>
			<pre>{JSON.stringify(formData, null, 2)}</pre>

			<h3>Form validation errors</h3>
			<pre>{JSON.stringify(errors, null, 2)}</pre>
		</FormProvider>
	);
};

export default AdvancedForm;
