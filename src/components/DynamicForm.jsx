import { Children, createElement, useRef } from 'react';
import PropTypes from 'prop-types';
import DynamicInput from './DynamicInput';
import { HANDLED_FORM_INPUT_TYPES } from '../constants';

/**
 * @name DynamicForm
 */
const DynamicForm = ({ children }) => {
	// @TODO: ref wrapper using useEffect hook
	const inputsRef = useRef({});

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
		Object.values(inputsRef.current).forEach(({ name, value }) => console.log(`${name}: ${value}`));
	};

	return (
		<div>
			<form onSubmit={handleSubmit}>
				{Children.map(children, (child) => (
					child.props.name && HANDLED_FORM_INPUT_TYPES.includes(child.type)
						? createElement(child.type, {
							...child.props,
							ref: (element) => { inputsRef.current[child.props.id] = element; },
						})
						: child
				))}
				<button type="submit">submit</button>
			</form>
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
