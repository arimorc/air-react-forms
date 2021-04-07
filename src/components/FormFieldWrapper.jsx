import { Children, createElement, forwardRef, useImperativeHandle, useRef } from 'react';
import PropTypes from 'prop-types';
import { HANDLED_FORM_INPUT_TYPES } from '../constants';

/**
 * @name FormFieldWrapper
 * @description A component used wrap an input and its linked labels / error / hint components to its parent form.
 *
 * @author Timothée Simon-Franza
 *
 * @param {*} children : The element to wrap.
 */
const FormFieldWrapper = forwardRef(({ children }, ref) => {
	const inputRef = useRef();

	useImperativeHandle(ref, () => ({
		focus: () => inputRef.current.focus(),
		getValue: () => (inputRef.current.value),
		getName: () => (inputRef.current.name),
	}));

	return (
		<>
			{Children.map(children, (child) => (
				child.props.name && HANDLED_FORM_INPUT_TYPES.includes(child.type)
					? createElement(child.type, {
						...child.props,
						ref: inputRef,
					})
					: child
			))}
		</>
	);
});

FormFieldWrapper.displayName = 'FormFieldWrapper';

FormFieldWrapper.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.element,
		PropTypes.elementType,
		PropTypes.arrayOf(PropTypes.oneOfType([
			PropTypes.element,
			PropTypes.elementType,
		])),
	]).isRequired,
};

export default FormFieldWrapper;
