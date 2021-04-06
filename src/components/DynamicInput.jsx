import PropTypes from 'prop-types';

/**
 * @name DynamicInput
 * @description A dynamic input to be used by the DynamicForm component.
 *
 * @author Timothée Simon-Franza
 *
 * @param {string}			id				: A unique identifier for the input.
 * @param {string}			name			: A name identifying the data.
 * @param {func}			onChange		: The method to trigger on input change.
 * @param {string|number}	[placeholder]	: An optional placeholder value.
 * @param {object}			[rules]			: Optional validation rules.
 * @param {string}			type			: The input's type.
 * @param {string|number}	value			: The current value.
 */
const DynamicInput = ({ id, name, onChange, placeholder, rules, type, value }) => (
	<input
		id={id}
		name={name}
		onChange={onChange}
		placeholder={placeholder}
		value={value}
		type={type}
		rules={rules}
	/>
);

DynamicInput.propTypes = {
	id: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
	placeholder: PropTypes.oneOfType([
		PropTypes.number,
		PropTypes.string,
	]),
	rules: PropTypes.arrayOf(PropTypes.shape({
		rule: PropTypes.object.isRequired,
		message: PropTypes.string.isRequired,
	})),
	type: PropTypes.string.isRequired,
	value: PropTypes.oneOfType([
		PropTypes.number,
		PropTypes.string,
	]).isRequired,
};

DynamicInput.defaultProps = {
	placeholder: '',
	rules: [],
};

export default DynamicInput;
