import { Children, createElement, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { HANDLED_FORM_INPUT_TYPES } from '../constants';

/**
 * @name FormFieldWrapper
 * @description A component used wrap an input and its linked labels / error / hint components to its parent form.
 *
 * @author Timothée Simon-Franza
 *
 * @param {*}		children			: The element to wrap.
 * @param {string}	name				: The name of the form field to wrap.
 * @param {object}	[rules]				: Optional validation rules to apply to the input.
 * @param {func}	registerFormField	: Calback method provided by the useForm hook to register field refs.
 * @param {func}	unregisterFormField	: Calback method provided by the useForm hook to unregister field refs.
 */
const FormFieldWrapper = ({ children, name, rules, registerFormField, unregisterFormField }) => {
	const inputRef = useRef();

	useEffect(() => {
		registerFormField({ element: inputRef.current, name, rules });

		return () => unregisterFormField(name);
	}, [inputRef, name, rules, registerFormField, unregisterFormField]);

	return (
		<>
			{Children.toArray(children).map((child) => (
				child.props.name && HANDLED_FORM_INPUT_TYPES.includes(child.type)
					? createElement(child.type, {
						...child.props,
						key: child.props.name,
						ref: inputRef,
					})
					: child
			))}
		</>
	);
};

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
	name: PropTypes.string.isRequired,
	rules: PropTypes.object,
	registerFormField: PropTypes.func.isRequired,
	unregisterFormField: PropTypes.func.isRequired,
};

FormFieldWrapper.defaultProps = {
	rules: undefined,
};

export default FormFieldWrapper;
