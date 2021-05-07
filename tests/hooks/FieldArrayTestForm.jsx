import { forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import {
	useFieldArray,
	useForm,
	FormProvider,
} from '../../src';

/**
 * @name FieldArrayTestForm
 * @description A component used to simply the fieldArray-related testing process.
 *
 * @author Timothée Simon-Franza
 *
 * @param {string} fieldArrayName		The name to register a fieldArray under.
 * @param {object} [fieldArrayRules]	Optional rules to apply to the fieldArray's children input.
 */
const FieldArrayTestForm = forwardRef(({ fieldArrayName, fieldArrayRules }, ref) => {
	const useFormResults = useForm({ validateOnChange: true });
	const { formContext, getFieldArrayValues } = useFormResults;
	const { fields, append, register: registerArrayField, remove } = useFieldArray({ name: fieldArrayName, rules: fieldArrayRules }, formContext);

	useImperativeHandle(ref, () => ({
		// eslint-disable-next-line require-jsdoc
		getUseFormResults() {
			return useFormResults;
		},

		// eslint-disable-next-line require-jsdoc
		append() {
			append();
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
			{fields.map((field) => <input key={field.id} {...registerArrayField(field)} defaultValue="abcd" />)}
		</FormProvider>
	);
});

FieldArrayTestForm.propTypes = {
	fieldArrayName: PropTypes.string.isRequired,
	fieldArrayRules: PropTypes.object,
};

FieldArrayTestForm.defaultProps = {
	fieldArrayRules: {},
};

export default FieldArrayTestForm;
