import { forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import { useFieldArray, useForm, FormProvider } from '../../src';

/**
 * @name FieldArrayTestForm
 * @description A component used to simply the fieldArray-related testing process.
 *
 * @author Timothée Simon-Franza
 *
 * @param {any}		[defaultValue]		The default value to apply to each input of the fieldArray.
 * @param {string} 	fieldArrayName		The name to register a fieldArray under.
 * @param {object} 	[fieldArrayRules]	Optional rules to apply to the fieldArray's children input.
 * @param {string}	fieldType			The type of field in the fieldArray.
 */
const FieldArrayTestForm = forwardRef(({ defaultValue, fieldArrayName, fieldArrayRules, fieldType }, ref) => {
	const useFormResults = useForm({ validateOnChange: true });
	const { formContext, unitTestingExports: { getFieldArrayValues } } = useFormResults;
	const { fields, register: registerArrayField, remove } = useFieldArray({ name: fieldArrayName, rules: fieldArrayRules }, formContext);

	useImperativeHandle(ref, () => ({
		// eslint-disable-next-line require-jsdoc
		getUseFormResults() {
			return useFormResults;
		},

		// eslint-disable-next-line require-jsdoc
		getFields() {
			return fields;
		},

		// eslint-disable-next-line require-jsdoc
		registerArrayField() {
			registerArrayField();
		},

		// eslint-disable-next-line require-jsdoc
		remove(fieldName) {
			remove(fieldName);
		},

		// eslint-disable-next-line require-jsdoc
		getContext() {
			return formContext;
		},

		// eslint-disable-next-line require-jsdoc
		getFieldArrayValues({ isFieldArray, ...data }) {
			return getFieldArrayValues(data);
		},
	}));

	return (
		<FormProvider context={formContext}>
			{fields.map((field) => <input key={field.id} data-testid={field.id} {...registerArrayField(field)} defaultValue={defaultValue} type={fieldType} />)}
		</FormProvider>
	);
});

FieldArrayTestForm.propTypes = {
	defaultValue: PropTypes.oneOfType([
		PropTypes.bool,
		PropTypes.number,
		PropTypes.string,
	]),
	fieldArrayName: PropTypes.string.isRequired,
	fieldArrayRules: PropTypes.object,
	fieldType: PropTypes.string,
};

FieldArrayTestForm.defaultProps = {
	defaultValue: undefined,
	fieldArrayRules: {},
	fieldType: 'text',
};

export default FieldArrayTestForm;
