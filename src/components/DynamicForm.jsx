import { Children, createElement, useCallback, useRef } from 'react';
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
		const formValues = Object.values(inputsRef.current)
			.map(({ element: { value }, name }) => ([name, value]));

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

	/**
	 * @function
	 * @name registerFormField
	 * @description A callback method used by controlled form fields to register themselves to the form.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {object} formFieldRef: The ref to register.
	 */
	const registerFormField = useCallback((formFieldRef) => {
		inputsRef.current[formFieldRef.name] = formFieldRef;
	}, [inputsRef]);

	/**
	 * @function
	 * @name unRegisterFormField
	 * @description A callback method used by controlled form fields to unregister themselves to the form.
	 *
	 * @author Timothée Simon-Franza
	 *
	 * @param {object} formFieldRefName: The name under which the ref has been registered.
	 */
	const unregisterFormField = useCallback((formFieldRefName) => {
		if (inputsRef.current[formFieldRefName]) {
			delete inputsRef.current[formFieldRefName];
		}
	}, [inputsRef]);

	return (
		<div>
			<form onSubmit={handleSubmit}>
				{Children.map(children.filter((child) => child), (child) => (
					child.type?.displayName === FormFieldWrapper.displayName
						? createElement(child.type, {
							...child.props,
							registerFormField,
							unregisterFormField,
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
