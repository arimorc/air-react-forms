import { useState } from 'react';
import { useForm, FormFieldWrapper, Validators } from 'air-react-forms';

/**
 * @name App
 * @description Entrypoint of the playground
 *
 * @author Yann Hodiesne
 */
const App = () => {
	const { formState: { errors }, handleSubmit, registerWrapper } = useForm();
	const [formData, setFormData] = useState({});
	const [toggle, setToggle] = useState(false);

	return (
		<div>
			<form onSubmit={(e) => setFormData(handleSubmit(e))}>
				<h1>useForm hook example</h1>
				{toggle && (
					<FormFieldWrapper {...registerWrapper('firstName')}>
						<label htmlFor="firstName">First name</label>
						<input
							id="firstName"
							name="firstName"
							type="text"
							defaultValue="john"
							rules={{
								required: 'This field is required',
							}}
						/>
					</FormFieldWrapper>
				)}
				<button type="button" onClick={() => setToggle(!toggle)}>toggle</button>

				<FormFieldWrapper
					{...registerWrapper('lastName')}
					rules={{
						required: Validators.isRequired('This field is required'),
					}}
				>
					<label htmlFor="lastName">Last name</label>
					<input id="lastName" name="lastName" type="text" defaultValue="doe" />
					<div>
						{errors.lastName?.required && <span>{errors.lastName.required}</span>}
					</div>
				</FormFieldWrapper>

				<FormFieldWrapper
					{...registerWrapper('hasUsedHooks')}
					rules={{
						customValidator: (value) => (value.trim().length === 0 ? 'custom validator error message' : ''),
					}}
				>
					<label htmlFor="hasUsedHooks">Ever used hooks before ?</label>
					<select
						id="hasUsedHooks"
						name="hasUsedHooks"
					>
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
				</FormFieldWrapper>
				<button type="submit">Submit</button>
			</form>
			<pre>{JSON.stringify(formData, null, 2)}</pre>
		</div>
	);
};

export default App;
