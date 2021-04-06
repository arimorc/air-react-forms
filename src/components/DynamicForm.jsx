import { useState } from 'react';
import DynamicInput from './DynamicInput';

/**
 * @name DynamicForm
 */
const DynamicForm = () => {
	const [inputs, setInputs] = useState([
		{ id: 'abcd', name: 'firstname', type: 'text', value: '' },
		{ id: 'efgh', name: 'lastname', type: 'text', value: '' },
	]);

	/**
	 * @function
	 * @name onInputChange
	 * @description Updates the input state with the new value.
	 *
	 * @author Timothée Simon-Franza
	 */
	const onInputChange = ({ target: { id: inputId, value } }) => {
		const inputIndex = inputs.findIndex(({ id }) => id === inputId);
		if (inputIndex < 0) {
			return;
		}

		setInputs([
			...inputs.slice(0, inputIndex),
			{ ...inputs[inputIndex], value },
			...inputs.slice(inputIndex + 1),
		]);
	};

	return (
		<div>
			<form>
				{inputs.map(({ id, name, type, value }) => (
					<DynamicInput
						id={id}
						key={id}
						name={name}
						onChange={onInputChange}
						type={type}
						value={value}
					/>
				))}
			</form>
			<pre>{ JSON.stringify(inputs, null, 2) }</pre>
		</div>
	);
};

export default DynamicForm;
