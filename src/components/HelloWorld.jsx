import { useState } from 'react';
import useForm from '../hooks/useForm';
import FormFieldWrapper from './FormFieldWrapper';

/**
 * @name HelloWorld
 * @description Hello, world!
 *
 * @author Yann Hodiesne
 */
const HelloWorld = () => {
	const { handleSubmit, registerFormField, unregisterFormField } = useForm();
	const [formData, setFormData] = useState({});

	return (
		<div>
			<form onSubmit={(e) => setFormData(handleSubmit(e))}>
				<h1>useForm hook example</h1>
				<FormFieldWrapper
					name="firstName"
					registerFormField={registerFormField}
					unregisterFormField={unregisterFormField}
				>
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
				<FormFieldWrapper
					name="lastName"
					registerFormField={registerFormField}
					unregisterFormField={unregisterFormField}
				>
					<label htmlFor="lastName">Last name</label>
					<input
						id="lastName"
						name="lastName"
						type="text"
						defaultValue="doe"
						rules={{
							required: 'This field is required',
						}}
					/>
				</FormFieldWrapper>
				<FormFieldWrapper
					name="hasUsedHooks"
					registerFormField={registerFormField}
					unregisterFormField={unregisterFormField}
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
				</FormFieldWrapper>
				<button type="submit">Submit</button>
			</form>
			<pre>{JSON.stringify(formData, null, 2)}</pre>
		</div>
	);
};

export default HelloWorld;
