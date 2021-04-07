import { Children, createElement, useRef } from 'react';
import PropTypes from 'prop-types';
import FormFieldWrapper from './FormFieldWrapper';

/**
 * @name DynamicForm
 */
const DynamicForm = ({ children }) => {
	const inputsRef = useRef({});

	/**
	 * @function
	 * @name getFormValues
	 * @description Returns the value of all fields as an object.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @returns {object}
	 */
	const getFormValues = () => {
		const formValues = Object.values(inputsRef.current).map(({ element: { getName, getValue } }) => ([getName(), getValue()]));

		return Object.fromEntries(formValues);
	};

	/**
	 * @function
	 * @name handleSubmit
	 * @description A handler used to apply validation to each controlled input of the form.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {object} event : The "form submit" event to handle.
	 */
	const handleSubmit = (event) => {
		event.preventDefault();
		console.log(getFormValues());
		Object.values(inputsRef.current)[0]?.element?.focus();
	};

	return (
		<div>
			<form onSubmit={handleSubmit}>
				{Children.map(children, (child) => (
					child.type?.displayName === FormFieldWrapper.displayName
						? createElement(child.type, {
							...child.props,
							ref: (element) => {
								inputsRef.current[child.props.name] = ({ element, ...child.props });
							},
						})
						: child
				))}

				<button type="submit">submit</button>
			</form>
			<pre>{ JSON.stringify(getFormValues()) }</pre>
		</div>
	);
};

DynamicForm.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.element,
		PropTypes.elementType,
		PropTypes.node,
		PropTypes.arrayOf(
			PropTypes.oneOfType(
				[
					PropTypes.element,
					PropTypes.elementType,
					PropTypes.node,
				]
			),
		),
	]).isRequired,
};

export default DynamicForm;
